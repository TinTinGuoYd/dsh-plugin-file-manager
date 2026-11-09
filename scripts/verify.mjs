#!/usr/bin/env node
/**
 * Release guard for a bare checkout: verifies the package manifest, the bundle
 * layer and the client bundle contract without installing anything, so
 * "npm run check" works locally and in CI with zero dependencies.
 *
 * Exits non-zero when any check fails, printing every failed check.
 * @module scripts/verify
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

/**
 * Run one check, recording a failure instead of throwing.
 * @param label - what the check proves.
 * @param run - the check body; its return value is printed as the detail.
 */
function check(label, run) {
	try {
		const detail = run();
		console.log("ok   " + label + (detail === undefined ? "" : ": " + detail));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		failures.push(label + ": " + message);
		console.log("FAIL " + label + ": " + message);
	}
}

/**
 * Async sibling of {@link check}, for checks that must await.
 * @param label - what the check proves.
 * @param run - the check body.
 */
async function checkRun(label, run) {
	try {
		const detail = await run();
		console.log("ok   " + label + (detail === undefined ? "" : ": " + detail));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		failures.push(label + ": " + message);
		console.log("FAIL " + label + ": " + message);
	}
}

/**
 * Throw when the condition does not hold.
 * @param condition - the assertion.
 * @param message - failure text.
 */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const dsh = manifest.dsh === undefined ? {} : manifest.dsh;
const clientExport = manifest.exports === undefined ? undefined : manifest.exports["./client"];
const clientPath = typeof clientExport === "string" ? clientExport : clientExport === undefined ? undefined : clientExport.default;

check("package.json", () => {
	assert(typeof manifest.name === "string" && manifest.name !== "", "name is required");
	assert(manifest.type === "module", "type must be module");
	assert(manifest.license === "MIT", "license must be MIT");
	return manifest.name + "@" + manifest.version;
});

check("dsh.client manifest", () => {
	assert(dsh.client !== undefined && dsh.client.platform === "web", "dsh.client.platform must be web");
	assert(Array.isArray(dsh.client.inject), "dsh.client.inject must be an array");
	return "inject=" + dsh.client.inject.length;
});

check("client export", () => {
	assert(typeof clientPath === "string", "exports[./client] must be a string or an object with a string default");
	assert(existsSync(join(root, clientPath)), "missing client bundle at " + clientPath);
	return clientPath;
});

check("package.json is exported", () => {
	assert(manifest.exports["./package.json"] === "./package.json", "the loader resolves name/package.json, so that export is required");
	return "ok";
});

check("dsh.bundle layer", () => {
	const patch = dsh.bundle === undefined ? undefined : dsh.bundle.patch;
	assert(typeof patch === "string", "dsh.bundle.patch is required");
	const file = join(root, patch.replace(/^\.\//, ""));
	assert(existsSync(file), "missing bundle patch at " + patch);
	const text = readFileSync(file, "utf8");
	assert(text.includes(manifest.name), "bundle patch does not name this package");
	assert(/^-\s+insert:/m.test(text), "bundle patch has no insert entry");
	return patch;
});

check("client bundle contract", () => {
	const source = readFileSync(join(root, clientPath), "utf8");
	assert(source.includes("window.__ModuleLoader__.load("), "client bundle must call window.__ModuleLoader__.load");
	assert(source.includes('id: "' + manifest.name + '"'), "client bundle id must equal the package name");
	assert(!/^\s*(?:import|export)[\s{*]/m.test(source), "client bundle must be a classic script, not an ES module");
	return manifest.name;
});

/**
 * Parse one file. The primary path is the real "node --check"; a sandbox that
 * forbids child-process stdio falls back to an in-process compile of the same
 * text, so the guard still means something where spawning is blocked.
 * @param file - repository-relative path.
 * @returns which parser proved it.
 */
async function parseCheck(file) {
	const absolute = join(root, file);
	const source = readFileSync(absolute, "utf8");
	try {
		execFileSync(process.execPath, ["--check", absolute], { stdio: "inherit" });
		return "node --check";
	} catch (error) {
		if (error !== undefined && error !== null && (error.code === "EPERM" || error.code === "ENOENT")) {
			// Functor body compilation catches syntax errors without executing anything;
			// the ESM half is instead imported, which parses it under the real loader.
			if (source.includes("export ")) await import(pathToFileURL(absolute).href);
			else new Function(source);
			return "in-process (spawn blocked)";
		}
		throw error;
	}
}

for (const file of ["lib/index.js", "lib/client.js"]) {
	await checkRun("parse " + file, () => parseCheck(file));
}

if (failures.length > 0) {
	console.error("");
	console.error(failures.length + " check(s) failed");
	process.exitCode = 1;
} else {
	console.log("");
	console.log("all checks passed");
}
