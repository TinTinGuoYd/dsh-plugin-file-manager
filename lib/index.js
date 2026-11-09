/**
 * dsh-plugin-file-manager -- host (Node) half.
 *
 * A dual-face plugin: this half registers the read-only HTTP surface the
 * browser half drives (GET /file-manager/api/{root,list,read}) on
 * ctx.webServer, and is otherwise empty. The browser half ships through
 * exports["./client"] and is discovered through the package.json dsh.client
 * declaration, so one profile row mounts both.
 *
 * The surface is deliberately read-only and dependency-free (node:fs only):
 * listing one level, and reading one file's text with a size cap. Nothing here
 * reaches a model request.
 * @module dsh-plugin-file-manager
 */
import { open, readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, posix, resolve, win32 } from "node:path";

/** Route prefix owned by this plugin (one prefix registration). */
const ROUTE_PREFIX = "/file-manager";

/** Upper bound on one listing level handed to the client. */
const DEFAULT_MAX_ENTRIES = 1500;

/** Upper bound on one file read (bytes); larger files report truncated. */
const DEFAULT_MAX_READ_BYTES = 512 * 1024;

/** Levels wider than this skip per-entry stats so a huge directory stays fast. */
const STAT_LIMIT = 800;

/** Concurrent stat probes per listing. */
const STAT_CONCURRENCY = 32;

/** Required services: the HTTP carrier this surface registers on. */
export const inject = ["webServer"];

/**
 * True when a path names one fixed filesystem location regardless of process
 * state: POSIX-absolute on POSIX; on Windows only drive-qualified or complete
 * UNC forms, mirroring the shipped directory browser's fence.
 * @param target - candidate path.
 * @returns whether the path is fully qualified on this platform.
 */
function fullyQualified(target) {
	if (process.platform === "win32") {
		return win32.isAbsolute(target) && /^(?:[A-Za-z]:[\\/]|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)/.test(target);
	}
	return posix.isAbsolute(target);
}

/** Absolute parent of a path, or null at the filesystem root. */
function parentOf(target) {
	const parent = dirname(target);
	return parent === target ? null : parent;
}

/** Write one JSON response with no-store caching. */
function sendJson(res, status, value) {
	const body = JSON.stringify(value);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"content-length": Buffer.byteLength(body)
	});
	res.end(body);
}

/** Message text of an unknown thrown value. */
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Run one probe over every item with bounded concurrency, preserving order.
 * @param items - source values.
 * @param probe - async mapper.
 * @returns mapped values in source order.
 */
async function mapLimit(items, probe) {
	const out = new Array(items.length);
	let next = 0;
	const worker = async () => {
		for (;;) {
			const index = next++;
			if (index >= items.length) return;
			out[index] = await probe(items[index], index);
		}
	};
	await Promise.all(Array.from({ length: Math.min(STAT_CONCURRENCY, items.length) }, worker));
	return out;
}

/**
 * Classify one dirent: a directory, a symbolic link (resolved to its target
 * kind when the probe succeeds), a file, or anything else.
 * @param parent - containing directory.
 * @param name - entry name.
 * @param kind - the dirent's own answer.
 * @returns the row with its stat fields filled in when the probe succeeded.
 */
async function classify(parent, name, kind) {
	const path = join(parent, name);
	const row = { name, path, kind, hidden: name.startsWith("."), size: null, mtimeMs: null };
	try {
		const info = await stat(path);
		if (kind === "link") row.kind = info.isDirectory() ? "dir" : info.isFile() ? "file" : "other";
		row.size = info.size;
		row.mtimeMs = info.mtimeMs;
	} catch {
		/* A broken or cyclic link stays listed as what the dirent reported. */
	}
	return row;
}

/** Directories first, then the rest, each name-ascending (natural, case-insensitive). */
function compareRows(left, right) {
	const leftDir = left.kind === "dir" ? 0 : 1;
	const rightDir = right.kind === "dir" ? 0 : 1;
	if (leftDir !== rightDir) return leftDir - rightDir;
	return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * List one directory level.
 * @param target - absolute directory.
 * @param showHidden - include dot-prefixed entries.
 * @param maxEntries - row bound; the level reports truncated when it bites.
 * @returns the listing value.
 */
async function listDirectory(target, showHidden, maxEntries) {
	const info = await stat(target);
	if (!info.isDirectory()) throw new Error("not a directory");
	const dirents = await readdir(target, { withFileTypes: true });
	const visible = [];
	let truncated = false;
	for (const dirent of dirents) {
		if (!showHidden && dirent.name.startsWith(".")) continue;
		if (visible.length >= maxEntries) {
			truncated = true;
			break;
		}
		const kind = dirent.isDirectory() ? "dir" : dirent.isSymbolicLink() ? "link" : dirent.isFile() ? "file" : "other";
		visible.push({ name: dirent.name, kind });
	}
	let rows;
	if (visible.length > STAT_LIMIT) {
		rows = visible.map((entry) => ({
			name: entry.name,
			path: join(target, entry.name),
			kind: entry.kind,
			hidden: entry.name.startsWith("."),
			size: null,
			mtimeMs: null
		}));
	} else {
		rows = await mapLimit(visible, (entry) => classify(target, entry.name, entry.kind));
	}
	rows.sort(compareRows);
	return { path: target, parent: parentOf(target), entries: rows, truncated };
}

/**
 * Read one file as UTF-8 text with a byte cap; binary content is reported as a
 * kind rather than decoded.
 * @param target - absolute file path.
 * @param maxBytes - read bound.
 * @returns the read value.
 */
async function readFileText(target, maxBytes) {
	const info = await stat(target);
	if (!info.isFile()) throw new Error("not a file");
	const length = Math.min(info.size, maxBytes);
	const buffer = Buffer.alloc(length);
	const handle = await open(target, "r");
	try {
		let offset = 0;
		while (offset < length) {
			const read = await handle.read(buffer, offset, length - offset, offset);
			if (read.bytesRead === 0) break;
			offset += read.bytesRead;
		}
		const slice = buffer.subarray(0, offset);
		const binary = slice.includes(0);
		return {
			path: target,
			size: info.size,
			mtimeMs: info.mtimeMs,
			kind: binary ? "binary" : "text",
			truncated: info.size > offset,
			text: binary ? null : stripBom(slice.toString("utf8"))
		};
	} finally {
		await handle.close().catch(() => {});
	}
}

/** Drop a leading UTF-8 BOM so a preview never starts with an invisible glyph. */
function stripBom(text) {
	return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Build the HTTP handler for the whole prefix.
 * @param settings - resolved plugin config.
 * @returns the route handler.
 */
function createHandler(settings) {
	return async function handle(req, res) {
		if (req.method !== "GET" && req.method !== "HEAD") {
			sendJson(res, 405, { error: "method-not-allowed" });
			return;
		}
		const url = new URL(req.url ?? "/", "http://localhost");
		const route = url.pathname.slice(ROUTE_PREFIX.length);
		const requested = url.searchParams.get("path") ?? undefined;
		try {
			if (route === "/api/root") {
				sendJson(res, 200, {
					root: settings.root,
					home: homedir(),
					cwd: process.cwd(),
					platform: process.platform
				});
				return;
			}
			if (route === "/api/list") {
				if (requested !== undefined && !fullyQualified(requested)) {
					sendJson(res, 400, { error: "path-not-absolute", path: requested });
					return;
				}
				const target = resolve(requested ?? settings.root);
				const listing = await listDirectory(target, url.searchParams.get("hidden") === "1", settings.maxEntries);
				sendJson(res, 200, listing);
				return;
			}
			if (route === "/api/read") {
				if (requested === undefined || !fullyQualified(requested)) {
					sendJson(res, 400, { error: "path-not-absolute", path: requested ?? null });
					return;
				}
				const value = await readFileText(resolve(requested), settings.maxReadBytes);
				sendJson(res, 200, value);
				return;
			}
			sendJson(res, 404, { error: "unknown-route", route });
		} catch (error) {
			sendJson(res, 500, { error: "read-failed", message: messageOf(error), path: requested ?? null });
		}
	};
}

/**
 * Host plugin body: register the read-only file surface on the web carrier.
 * @param ctx - host context carrying webServer.
 * @param config - optional { root, maxEntries, maxReadBytes }.
 */
export function apply(ctx, config) {
	const settings = {
		root: resolve(config?.root ?? process.cwd()),
		maxEntries: config?.maxEntries ?? DEFAULT_MAX_ENTRIES,
		maxReadBytes: config?.maxReadBytes ?? DEFAULT_MAX_READ_BYTES
	};
	const handler = createHandler(settings);
	ctx.effect(() => ctx.webServer.register({ kind: "prefix", path: ROUTE_PREFIX, handler }), "file-manager: routes");
}
