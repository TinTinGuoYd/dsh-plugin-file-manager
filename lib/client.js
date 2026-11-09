window.__ModuleLoader__.load({
	id: "dsh-plugin-file-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;

		/* ------------------------------------------------------------------ *
		 * Styles: one owned <style> tag, claimed by the module loader as this
		 * plugin's (HMR removes it with the bundle).
		 * ------------------------------------------------------------------ */

		const STYLE_TAG = "dsh-plugin-file-manager/file-manager.css";
		const CSS = [
			"body.fm_docked{padding-right:var(--fm-dock-width,0px)}",
			".fm_dock{position:fixed;top:0;right:0;bottom:0;z-index:30;display:flex;flex-direction:column;min-width:0;background:var(--dsw-alias-bg-layer-1,#1b1b1b);border-left:1px solid var(--dsw-alias-border-l1,#333);color:var(--dsw-alias-label-primary,#e8e8e8);font-size:13px;line-height:20px;pointer-events:auto}",
			".fm_rail{position:fixed;top:0;right:0;bottom:0;z-index:30;display:flex;flex-direction:column;align-items:center;gap:8px;width:40px;padding-top:16px;background:var(--dsw-alias-bg-layer-1,#1b1b1b);border-left:1px solid var(--dsw-alias-border-l1,#333);pointer-events:auto}",
			".fm_resize{position:absolute;top:0;bottom:0;left:-3px;z-index:2;width:6px;cursor:col-resize}",
			".fm_resize:hover{background:var(--dsw-alias-border-l3,rgba(255,255,255,.18))}",
			".fm_head{display:flex;align-items:center;gap:6px;padding:9px 8px 9px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,#333);flex:none}",
			".fm_title{display:flex;align-items:center;gap:6px;flex:1;min-width:0;font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}",
			".fm_iconBtn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary,#9a9a9a);cursor:pointer;flex:none}",
			".fm_iconBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));color:var(--dsw-alias-label-primary,#e8e8e8)}",
			".fm_iconBtn:disabled{opacity:.45;cursor:default}",
			".fm_toolbar{display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#333);flex:none}",
			".fm_path{flex:1;min-width:0;height:26px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2,#3a3a3a);border-radius:7px;background:var(--dsw-alias-bg-layer-2,rgba(255,255,255,.04));color:inherit;font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,monospace);font-size:11px;outline:none}",
			".fm_path:focus{border-color:var(--dsw-alias-brand-primary,#4c8dff)}",
			".fm_crumbs{display:flex;align-items:center;gap:1px;padding:4px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#333);overflow-x:auto;overflow-y:hidden;white-space:nowrap;font-size:11px;flex:none;scrollbar-width:none}",
			".fm_crumbs::-webkit-scrollbar{display:none}",
			".fm_crumb{max-width:150px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:1px 4px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary,#bdbdbd);cursor:pointer;font-size:11px;flex:none}",
			".fm_crumb:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08));color:var(--dsw-alias-label-primary,#e8e8e8)}",
			".fm_crumbSep{flex:none;color:var(--dsw-alias-label-tertiary,#6f6f6f)}",
			".fm_listWrap{flex:1 1 55%;display:flex;flex-direction:column;min-height:0;border-bottom:1px solid var(--dsw-alias-border-l1,#333)}",
			".fm_list{flex:1;margin:0;padding:4px;list-style:none;overflow:auto;min-height:0}",
			".fm_row{display:flex;align-items:center;gap:6px;width:100%;padding:3px 6px;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;cursor:pointer;font-size:12px}",
			".fm_row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08))}",
			".fm_rowActive{background:var(--dsw-alias-interactive-bg-active,rgba(255,255,255,.14))}",
			".fm_rowName{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}",
			".fm_rowMeta{flex:none;color:var(--dsw-alias-label-tertiary,#8a8a8a);font-size:10px;font-variant-numeric:tabular-nums}",
			".fm_glyph{flex:none;color:var(--dsw-alias-label-tertiary,#9a9a9a)}",
			".fm_glyphDir{color:var(--dsw-alias-brand-primary,#5b9cff)}",
			".fm_preview{flex:1 1 45%;display:flex;flex-direction:column;min-height:0}",
			".fm_previewHead{display:flex;align-items:center;gap:4px;padding:4px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#333);min-height:30px;flex:none}",
			".fm_previewName{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:11px;color:var(--dsw-alias-label-secondary,#bdbdbd)}",
			".fm_code{flex:1;margin:0;padding:8px 10px;overflow:auto;background:transparent;color:var(--dsw-alias-label-primary,#e8e8e8);font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,monospace);font-size:11px;line-height:17px;white-space:pre;tab-size:4;min-height:0}",
			".fm_hint{display:flex;flex:1;align-items:center;justify-content:center;padding:16px;color:var(--dsw-alias-label-tertiary,#8a8a8a);text-align:center;font-size:11px;min-height:0}",
			".fm_foot{display:flex;align-items:center;gap:6px;padding:3px 8px;border-top:1px solid var(--dsw-alias-border-l1,#333);color:var(--dsw-alias-label-tertiary,#8a8a8a);font-size:10px;min-height:24px;flex:none}",
			".fm_footSpacer{flex:1}",
			".fm_ellipsis{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%}",
			".fm_spin{animation:fm_spin 1s linear infinite}",
			"@keyframes fm_spin{to{transform:rotate(360deg)}}",
			".fm_error{color:var(--dsw-alias-state-error-primary,#ff6b6b)}"
		].join("\n");

		if (typeof document !== "undefined") {
			const selector = "style[data-plugin-css=" + JSON.stringify(STYLE_TAG) + "]";
			if (document.querySelector(selector) === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-plugin-file-manager";
				tag.dataset.pluginCss = STYLE_TAG;
				tag.textContent = CSS;
				document.head.appendChild(tag);
			}
		}

		/* ------------------------------------------------------------------ *
		 * Host API (/file-manager/api/*, registered by this plugin's node half).
		 * ------------------------------------------------------------------ */

		const API = "/file-manager/api";

		/** Open a file with the host operating system's default application on click. */
		const OPEN_ON_CLICK = true;

		/** Panel width bounds and the collapsed rail width. */
		const MIN_WIDTH = 280;
		const MAX_WIDTH = 760;
		const DEFAULT_WIDTH = 380;
		const RAIL_WIDTH = 40;

		/** The client context, captured at apply() so actions can reach services lazily. */
		let clientCtx = null;

		/** Build one API URL with an encoded query. */
		function apiUrl(route, params) {
			let url = API + route;
			const pairs = [];
			if (params !== undefined) {
				for (const key of Object.keys(params)) {
					const value = params[key];
					if (value === undefined || value === null) continue;
					pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));
				}
			}
			if (pairs.length > 0) url += "?" + pairs.join("&");
			return url;
		}

		/** GET one JSON payload, turning a host error body into a thrown Error. */
		async function getJson(url, signal) {
			const response = await fetch(url, { signal: signal, headers: { accept: "application/json" } });
			let payload = null;
			try { payload = await response.json(); } catch (error) { payload = null; }
			if (!response.ok) {
				const detail = payload !== null && typeof payload === "object" ? payload.message || payload.error : null;
				throw new Error(detail ? String(detail) : "HTTP " + response.status);
			}
			return payload;
		}
		/* ------------------------------------------------------------------ *
		 * Shared panel state: expanded flag, dock width and the last directory
		 * visited. Persisted so a reload lands where the user left off.
		 * ------------------------------------------------------------------ */

		const STORAGE_KEY = "dsh-plugin-file-manager:dock";

		/** Read the persisted dock preferences (a broken entry falls back to defaults). */
		function readStoredDock() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				return parsed !== null && typeof parsed === "object" ? parsed : null;
			} catch (error) {
				return null;
			}
		}

		const stored = readStoredDock();
		const view = {
			open: stored !== null && stored.open === false ? false : true,
			width: stored !== null && typeof stored.width === "number" ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, stored.width)) : DEFAULT_WIDTH,
			lastPath: stored !== null && typeof stored.lastPath === "string" ? stored.lastPath : null
		};
		const viewListeners = new Set();

		/** Persist the dock preferences; storage failures are not the user's problem. */
		function persistDock() {
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ open: view.open, width: view.width, lastPath: view.lastPath }));
			} catch (error) {
				/* Private mode or a quota wall: the in-memory value still works. */
			}
		}

		/** Write the shared state, persist it, and wake every mounted reader. */
		function publishState(patch) {
			Object.assign(view, patch);
			persistDock();
			for (const listener of viewListeners) listener();
		}

		/** Subscribe the calling component to the shared state. */
		function useView() {
			const pair = React.useState(0);
			const bump = pair[1];
			React.useEffect(() => {
				const listener = () => bump((count) => count + 1);
				viewListeners.add(listener);
				return () => { viewListeners.delete(listener); };
			}, []);
			return view;
		}

		/* ------------------------------------------------------------------ *
		 * Formatting helpers.
		 * ------------------------------------------------------------------ */

		/** Human byte size in at most one decimal. */
		function formatSize(bytes) {
			if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "";
			if (bytes < 1024) return bytes + " B";
			const units = ["KB", "MB", "GB", "TB"];
			let value = bytes / 1024;
			let unit = 0;
			while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
			return (value >= 10 ? Math.round(value) : Math.round(value * 10) / 10) + " " + units[unit];
		}

		/**
		 * Ancestor chain from the filesystem root to the path inclusive, each row
		 * a jump target. Windows keeps the drive as the first crumb.
		 */
		function crumbsOf(target) {
			if (typeof target !== "string" || target === "") return [];
			const windows = /^[A-Za-z]:[\\/]/.test(target) || target.indexOf("\\") !== -1;
			const separator = windows ? "\\" : "/";
			const trimmed = target.replace(/[\\/]+$/, "");
			if (trimmed === "") return [{ label: target, path: target }];
			const parts = trimmed.split(/[\\/]+/);
			const crumbs = [];
			if (!windows && trimmed.charAt(0) === "/") crumbs.push({ label: "/", path: "/" });
			let accumulated = "";
			for (const part of parts) {
				if (part === "") continue;
				if (accumulated === "") accumulated = windows ? part + separator : (trimmed.charAt(0) === "/" ? "/" + part : part);
				else accumulated = accumulated.replace(/[\\/]+$/, "") + separator + part;
				crumbs.push({ label: part, path: accumulated });
			}
			return crumbs;
		}

		/** Last path segment of a target, for the preview title. */
		function baseName(target) {
			if (typeof target !== "string" || target === "") return "";
			const segments = target.split(/[\\/]+/).filter((segment) => segment !== "");
			if (segments.length === 0) return target;
			return /^[A-Za-z]:$/.test(segments[0]) && segments.length === 1 ? segments[0] : segments[segments.length - 1];
		}

		/* ------------------------------------------------------------------ *
		 * Glyphs.
		 * ------------------------------------------------------------------ */

		/** Generic document glyph (14px, currentColor). */
		function DocumentGlyph(props) {
			return h(
				"svg",
				Object.assign({ width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true }, props),
				h("path", { d: "M4 1.75h5.2L12.5 5v9.25H4z", stroke: "currentColor", strokeWidth: 1.1, strokeLinejoin: "round" }),
				h("path", { d: "M9.1 1.9V5.1h3.1", stroke: "currentColor", strokeWidth: 1.1, strokeLinejoin: "round" })
			);
		}

		/** Render one primitive icon when the seed module still exports it. */
		function primitiveIcon(name, className) {
			const Component = primitives[name];
			if (typeof Component !== "function" && typeof Component !== "object") return null;
			return h(Component, { className: className });
		}

		/* ------------------------------------------------------------------ *
		 * Workspace signals: the panel follows the session's directory.
		 * ------------------------------------------------------------------ */

		/** Current session's working directory, or null while no session is open. */
		function selectSessionCwd(state) {
			const id = state.current;
			if (id === undefined || id === null) return null;
			const summary = state.byId[id];
			const cwd = summary !== undefined && summary !== null ? summary.cwd : undefined;
			return typeof cwd === "string" && cwd !== "" ? cwd : null;
		}

		/** Most recently active Workspace path, or null before the baseline lands. */
		function selectRecentWorkspace(state) {
			const items = state.items;
			if (!Array.isArray(items) || items.length === 0) return null;
			const recent = items.find((item) => item.workspaceId === state.recentWorkspaceId);
			const chosen = recent !== undefined ? recent : items[0];
			return typeof chosen.path === "string" && chosen.path !== "" ? chosen.path : null;
		}
		/* ------------------------------------------------------------------ *
		 * The docked panel (slot: shell.overlay, fixed to the right edge).
		 * ------------------------------------------------------------------ */

		/**
		 * Right-hand file panel. It follows the current session's directory
		 * (falling back to the most recent Workspace) whenever that changes, and
		 * clicking a file hands it to the operating system's default application
		 * while also previewing it in place.
		 * @param props - slot currency: the global useSessions/useWorkspaces hooks.
		 */
		function FileManagerDock(props) {
			const state = useView();

			const sessionCwd = props.useSessions(selectSessionCwd);
			const recentWorkspace = props.useWorkspaces(selectRecentWorkspace);
			const followTarget = sessionCwd !== null ? sessionCwd : recentWorkspace;

			const pathPair = React.useState(null);
			const path = pathPair[0];
			const setPath = pathPair[1];

			const hiddenPair = React.useState(false);
			const showHidden = hiddenPair[0];
			const setShowHidden = hiddenPair[1];

			const listingPair = React.useState(null);
			const listing = listingPair[0];
			const setListing = listingPair[1];

			const errorPair = React.useState(null);
			const listingError = errorPair[0];
			const setListingError = errorPair[1];

			const busyPair = React.useState(false);
			const loading = busyPair[0];
			const setLoading = busyPair[1];

			const selectedPair = React.useState(null);
			const selected = selectedPair[0];
			const setSelected = selectedPair[1];

			const previewPair = React.useState(null);
			const preview = previewPair[0];
			const setPreview = previewPair[1];

			const noticePair = React.useState(null);
			const notice = noticePair[0];
			const setNotice = noticePair[1];

			const draftPair = React.useState("");
			const draft = draftPair[0];
			const setDraft = draftPair[1];

			const noncePair = React.useState(0);
			const nonce = noncePair[0];
			const reload = noncePair[1];

			/** The Workspace path last synced into this panel (undefined before the first sync). */
			const followedRef = React.useRef(undefined);

			/* Follow workspace changes; resolve the first directory when nothing has. */
			React.useEffect(() => {
				if (followTarget !== null && followTarget !== undefined) {
					if (followedRef.current === followTarget) return undefined;
					followedRef.current = followTarget;
					setSelected(null);
					setNotice(null);
					setPath(followTarget);
					return undefined;
				}
				if (path !== null) return undefined;
				if (view.lastPath !== null) {
					setPath(view.lastPath);
					return undefined;
				}
				let live = true;
				getJson(apiUrl("/root"))
					.then((value) => { if (live) setPath(value.root); })
					.catch((error) => { if (live) setListingError(error.message); });
				return () => { live = false; };
			}, [followTarget, path]);

			/* One directory level, aborted when a newer request supersedes it. */
			React.useEffect(() => {
				if (path === null) return undefined;
				const controller = new AbortController();
				let live = true;
				setLoading(true);
				setListingError(null);
				getJson(apiUrl("/list", { path: path, hidden: showHidden ? 1 : 0 }), controller.signal)
					.then((value) => {
						if (!live) return;
						setListing(value);
						view.lastPath = value.path;
						persistDock();
						setDraft(value.path);
						setLoading(false);
					})
					.catch((error) => {
						if (!live || controller.signal.aborted) return;
						setListingError(error.message);
						setLoading(false);
					});
				return () => { live = false; controller.abort(); };
			}, [path, showHidden, nonce]);

			/* The selected file's text. */
			React.useEffect(() => {
				if (selected === null) { setPreview(null); return undefined; }
				const controller = new AbortController();
				let live = true;
				setPreview({ loading: true, path: selected });
				getJson(apiUrl("/read", { path: selected }), controller.signal)
					.then((value) => {
						if (!live) return;
						setPreview(Object.assign({ loading: false }, value));
					})
					.catch((error) => {
						if (!live || controller.signal.aborted) return;
						setPreview({ loading: false, path: selected, error: error.message });
					});
				return () => { live = false; controller.abort(); };
			}, [selected]);

			/* Keep the app reflowed around the dock while it is mounted. */
			React.useEffect(() => {
				if (typeof document === "undefined" || document.body === undefined) return undefined;
				const body = document.body;
				const width = state.open ? state.width : RAIL_WIDTH;
				body.classList.add("fm_docked");
				body.style.setProperty("--fm-dock-width", width + "px");
				return () => {
					body.classList.remove("fm_docked");
					body.style.removeProperty("--fm-dock-width");
				};
			}, [state.open, state.width]);

			/** Navigate to one directory (clearing the preview). */
			const navigate = (target) => {
				setNotice(null);
				setSelected(null);
				setPath(target);
			};

			/** Copy a path to the clipboard. */
			const copyPath = async (target) => {
				try {
					await navigator.clipboard.writeText(target);
					setNotice("已复制路径");
				} catch (error) {
					setNotice("复制失败：" + String((error && error.message) || error));
				}
			};

			/** Hand a path to the host operating system's default application. */
			const openWithSystem = async (target, quiet) => {
				const workspaces = clientCtx !== null && typeof clientCtx.get === "function" ? clientCtx.get("workspaces") : undefined;
				if (workspaces === undefined || workspaces === null || typeof workspaces.openPath !== "function") {
					if (quiet !== true) setNotice("当前宿主未提供「用系统应用打开」能力");
					return;
				}
				try {
					await workspaces.openPath(target);
					if (quiet !== true) setNotice("已用系统默认应用打开：" + baseName(target));
				} catch (error) {
					setNotice("系统打开失败：" + String((error && error.message) || error));
				}
			};

			/** Row activation: directories descend, files preview and open externally. */
			const activate = (entry) => {
				if (entry.kind === "dir") {
					navigate(entry.path);
					return;
				}
				setSelected(entry.path);
				setNotice(null);
				if (OPEN_ON_CLICK) void openWithSystem(entry.path, true);
			};

			/** Drag the left edge to resize the dock. */
			const startResize = (event) => {
				if (event.button !== undefined && event.button !== 0) return;
				event.preventDefault();
				const startX = event.clientX;
				const startWidth = view.width;
				const onMove = (moveEvent) => {
					const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (startX - moveEvent.clientX)));
					if (next !== view.width) publishState({ width: next });
				};
				const onUp = () => {
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
					document.body.style.cursor = "";
				};
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
				document.body.style.cursor = "col-resize";
			};

			const current = listing !== null ? listing.path : path;
			const entries = listing !== null && Array.isArray(listing.entries) ? listing.entries : [];
			const parent = listing !== null ? listing.parent : null;
			const crumbs = crumbsOf(current || "");
			const truncated = listing !== null && listing.truncated === true;

			/* Collapsed: leave a 40px rail with the expand affordance. */
			if (!state.open) {
				return h(
					"div",
					{ className: "fm_rail" },
					h(
						"button",
						{
							type: "button",
							className: "fm_iconBtn",
							title: "打开文件管理",
							"aria-label": "打开文件管理",
							onClick: () => publishState({ open: true })
						},
						primitiveIcon("IconFolderOpen16", "fm_glyph fm_glyphDir")
					)
				);
			}

			/** Rows of the current level. */
			const rows = entries.map((entry) => {
				const isDir = entry.kind === "dir";
				const active = !isDir && entry.path === selected;
				return h(
					"li",
					{ key: entry.path },
					h(
						"button",
						{
							type: "button",
							className: active ? "fm_row fm_rowActive" : "fm_row",
							title: entry.path,
							onClick: () => activate(entry)
						},
						isDir ? primitiveIcon("IconFolderOpen16", "fm_glyph fm_glyphDir") : h(DocumentGlyph, { className: "fm_glyph" }),
						h("span", { className: "fm_rowName" }, entry.name),
						h("span", { className: "fm_rowMeta" }, isDir ? "" : formatSize(entry.size))
					)
				);
			});

			/** The preview body: text, binary notice, error, or the empty hint. */
			const previewBody = () => {
				if (selected === null) return h("div", { className: "fm_hint" }, "点击文件即可用系统默认应用打开，并在此处预览内容");
				if (preview === null || preview.loading === true) return h("div", { className: "fm_hint" }, "读取中…");
				if (preview.error !== undefined && preview.error !== null) {
					return h("div", { className: "fm_hint fm_error" }, String(preview.error));
				}
				if (preview.kind === "binary") {
					return h("div", { className: "fm_hint" }, "二进制文件（" + formatSize(preview.size) + "），不做文本预览");
				}
				return h("pre", { className: "fm_code" }, preview.text === null || preview.text === undefined ? "" : String(preview.text));
			};

			return h(
				"aside",
				{
					className: "fm_dock",
					style: { width: state.width + "px" },
					"aria-label": "文件管理"
				},
				h("div", { className: "fm_resize", onPointerDown: startResize, title: "拖动调整宽度" }),
				h(
					"div",
					{ className: "fm_head" },
					h(
						"div",
						{ className: "fm_title", title: current || "" },
						primitiveIcon("IconFolderOpen16", "fm_glyph fm_glyphDir"),
						h("span", { className: "fm_ellipsis" }, "文件管理")
					),
					h(
						"button",
						{
							type: "button",
							className: "fm_iconBtn",
							title: "刷新",
							"aria-label": "刷新目录",
							disabled: loading,
							onClick: () => reload((value) => value + 1)
						},
						primitiveIcon("IconRefreshOutline16", loading ? "fm_spin" : undefined)
					),
					h(
						"button",
						{
							type: "button",
							className: "fm_iconBtn",
							title: "收起面板",
							"aria-label": "收起文件管理面板",
							onClick: () => publishState({ open: false })
						},
						primitiveIcon("IconChevronRightOutline14", undefined)
					)
				),
				h(
					"div",
					{ className: "fm_toolbar" },
					h(
						"button",
						{
							type: "button",
							className: "fm_iconBtn",
							title: "上一级",
							"aria-label": "上一级",
							disabled: parent === null,
							onClick: () => { if (parent !== null) navigate(parent); }
						},
						primitiveIcon("IconChevronUpOutline14", undefined)
					),
					h("input", {
						className: "fm_path",
						type: "text",
						value: draft,
						spellCheck: false,
						"aria-label": "路径",
						placeholder: "输入绝对路径后回车跳转",
						onChange: (event) => setDraft(event.target.value),
						onKeyDown: (event) => {
							if (event.key !== "Enter") return;
							const target = draft.trim();
							if (target !== "") navigate(target);
						}
					}),
					h(
						"label",
						{ className: "fm_check", title: "显示以 . 开头的隐藏条目" },
						h("input", {
							type: "checkbox",
							checked: showHidden,
							"aria-label": "显示隐藏条目",
							onChange: (event) => setShowHidden(event.target.checked)
						})
					)
				),
				h(
					"div",
					{ className: "fm_crumbs" },
					crumbs.reduce((nodes, crumb, index) => {
						if (index > 0) nodes.push(h("span", { key: crumb.path + "-sep", className: "fm_crumbSep" }, "/"));
						nodes.push(
							h(
								"button",
								{
									key: crumb.path,
									type: "button",
									className: "fm_crumb",
									title: crumb.path,
									onClick: () => navigate(crumb.path)
								},
								crumb.label
							)
						);
						return nodes;
					}, [])
				),
				h(
					"div",
					{ className: "fm_listWrap" },
					listingError !== null
						? h("div", { className: "fm_hint fm_error" }, listingError)
						: h("ul", { className: "fm_list" }, rows)
				),
				h(
					"div",
					{ className: "fm_preview" },
					h(
						"div",
						{ className: "fm_previewHead" },
						h("span", { className: "fm_previewName", title: selected === null ? "" : selected }, selected === null ? "预览" : baseName(selected)),
						selected !== null && preview !== null && preview.truncated === true
							? h("span", { className: "fm_rowMeta" }, "已截断")
							: null,
						selected !== null
							? h(
									"button",
									{
										type: "button",
										className: "fm_iconBtn",
										title: "用系统默认应用打开",
										"aria-label": "用系统默认应用打开",
										onClick: () => openWithSystem(selected)
									},
									primitiveIcon("IconRightUpOutline16", undefined)
								)
							: null,
						selected !== null
							? h(
									"button",
									{
										type: "button",
										className: "fm_iconBtn",
										title: "复制文件路径",
										"aria-label": "复制文件路径",
										onClick: () => copyPath(selected)
									},
									primitiveIcon("IconCopyOutline16", undefined)
								)
							: null
					),
					previewBody()
				),
				h(
					"div",
					{ className: "fm_foot" },
					h("span", { className: "fm_rowMeta" }, loading ? "读取中…" : entries.length + " 项" + (truncated ? "+" : "")),
					notice !== null ? h("span", { className: "fm_ellipsis", title: notice }, notice) : null,
					h("span", { className: "fm_footSpacer" }),
					h(
						"button",
						{
							type: "button",
							className: "fm_iconBtn",
							title: current === null || current === undefined ? "复制当前目录" : "复制当前目录：" + current,
							"aria-label": "复制当前目录",
							onClick: () => { if (current !== null && current !== undefined) copyPath(current); }
						},
						primitiveIcon("IconCopyOutline16", undefined)
					),
					h(
						"button",
						{
							type: "button",
							className: "fm_iconBtn",
							title: "在系统文件管理器中打开当前目录",
							"aria-label": "在系统文件管理器中打开当前目录",
							onClick: () => { if (current !== null && current !== undefined) openWithSystem(current); }
						},
						primitiveIcon("IconBrowseOutline16", undefined)
					)
				)
			);
		}

		/* ------------------------------------------------------------------ *
		 * Plugin body: one docked panel contribution.
		 * ------------------------------------------------------------------ */

		/** Required services: the slot registry the panel registers into. */
		const inject = ["slots"];

		/**
		 * Client plugin body.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			clientCtx = ctx;
			ctx.slots.inject("shell.overlay", () =>
				ctx.slots.register(
					{
						name: "shell.overlay",
						id: "file-manager-dock",
						order: 10
					},
					FileManagerDock
				)
			);
		}

		exports.apply = apply;
		exports.inject = inject;
		/** Shared dock state: expand flag, width and the last directory. */
		exports.view = view;
		return module.exports;
	}
});
