# dsh-plugin-file-manager

A file manager panel for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) web UI,
docked to the right edge of the browser. It lists the current workspace, previews text files inline,
and hands files to your operating system's default application.

- **Docked, not floating.** Opening the panel adds a right padding to `body`, so the app's own
  three-column grid narrows around it. Nothing is covered.
- **Follows the workspace.** It opens in the current session's working directory and jumps there
  automatically whenever you switch workspace or session.
- **One click to open.** Clicking a file launches it in the system default application while the
  panel previews its text. Directories are entered on click.
- **Zero build step.** The browser half is a hand-written lazy-CJS bundle; edit it and refresh.

## Features

| | |
| --- | --- |
| Right-docked panel | Drag the left edge to resize (280-760 px), collapse to a 40 px rail. Width, expanded state and last directory persist in `localStorage`. |
| Workspace following | Current session `cwd` → most recent Workspace → host process directory. |
| Browsing | Breadcrumb jumps, parent, editable path box (Enter to jump), refresh, hidden-entry toggle. Directories first, natural name order, file sizes. |
| Preview | Read-only text preview capped at 512 KiB (`maxReadBytes`), flagged as truncated beyond it. Binary files are detected and not decoded. |
| Opening | `host.openPath` through `ctx.workspaces` — the OS default application. Also available as an explicit button, plus copy-path and open-folder. |

## Requirements

- `dsh` 0.1.0-rc.6 or later, booted with the `web` profile (`dsh web`).
- Node.js 22+ on the host (the `dsh` runtime requirement).

## Install

### Option A — as a profile bundle (recommended)

The package declares `dsh.bundle`, so `dsh plugin` installs it *and* wires the profile row:

```sh
dsh plugin --profile web add dsh-plugin-file-manager   # once published to npm
dsh plugin --profile web add ./dsh-plugin-file-manager # from a checkout or tarball
```

Then start (or restart) `dsh web`. No `cordis.patch.yml` edit is needed — the bundle layer ships the
insert row.

### Option B — manual, no pnpm

1. Make the package resolvable by its bare name from the profile directory, e.g. a junction on
   Windows (a symlink works on macOS and Linux):

   ```powershell
   New-Item -ItemType Junction `
     -Path "$env:USERPROFILE\.dsh\profiles\node_modules\dsh-plugin-file-manager" `
     -Target "<absolute path to this checkout>"
   ```

2. Insert the row in your own patch layer (`~/.dsh/profiles/web/cordis.patch.yml`):

   ```yaml
   - insert:
       - id: file-manager
         name: 'dsh-plugin-file-manager'
   ```

   That file is watched: the node half mounts immediately and the HTTP surface is live.
   The browser half is part of the page boot graph, so **refresh the page** to pick it up.

> Use exactly one of the two options. Doing both inserts the row twice and the Loader rejects the
> duplicate entry id.

## Usage

1. Open the dsh web UI. The panel appears on the right; if you collapsed it earlier, click the
   folder icon on the 40 px rail.
2. The panel starts in the current session's workspace. Click a folder to enter it, a crumb to jump,
   or type an absolute path and press Enter.
3. Click a file: it opens in your system default application, and its text appears below the list.
4. The preview header has an explicit *open with system app* button and a *copy path* button; the
   footer opens or copies the current directory.

To preview without launching: set `const OPEN_ON_CLICK = true;` to `false` near the top of
`lib/client.js`.

## Configuration

All keys are optional. Set them on the inserted row:

```yaml
- insert:
    - id: file-manager
      name: 'dsh-plugin-file-manager'
      config:
        root: 'C:\path\to\fallback-folder'  # only a fallback: a session cwd wins
        maxEntries: 1500                     # rows per directory level
        maxReadBytes: 524288                 # 512 KiB text preview cap
```

| Key | Default | Meaning |
| --- | --- | --- |
| `root` | `process.cwd()` | Directory used when no session and no workspace exists yet. |
| `maxEntries` | `1500` | Rows returned for one level; beyond it the listing reports `truncated`. |
| `maxReadBytes` | `524288` | Bytes read for one text preview; larger files are flagged truncated. |

## How it works

This is a **dual-face** package: one profile row mounts both halves.

| Half | Entry | Role |
| --- | --- | --- |
| Node (host) | `lib/index.js` | Registers the read-only `GET /file-manager/api/{root,list,read}` prefix on `ctx.webServer`. |
| Browser | `lib/client.js` | Discovered through the `dsh.client` manifest, served from `/plugins/<id>/client.js`, registers one `shell.overlay` entry. |

- The HTTP surface is plain `node:http` handlers over `node:fs/promises` — no harness RPC contract,
  no third-party dependency. Only fully-qualified paths are accepted (on Windows: drive-qualified
  or complete UNC), matching the fence the shipped directory picker applies.
- The client bundle follows the DSH lazy-CJS convention:
  `window.__ModuleLoader__.load({ id, factory })`, where `factory(require)` may only require the
  platform seed modules. This one requires `react` and
  `@deepseek-ai/dsh-client-ui-primitives`, so no bundler is involved.
- `shell.overlay` is the frame-wide floating layer (a `list` slot, click-through until an entry opts
  into pointer events). The panel is `position: fixed` inside it, which is why it can sit outside the
  frame's grid while `body` padding makes the grid yield the space.

## Security and privacy

- **Read only.** There is no write, delete, rename or create endpoint, and no shell execution.
- **No outbound network.** The host serves local HTTP; the browser half only calls its own origin
  (`/file-manager/api/*`). No telemetry, analytics or remote assets.
- **Loopback by default.** It rides dsh's own web server (default `127.0.0.1`). No CORS headers are
  sent, so a third-party page cannot read responses.
- **Whole-filesystem scope.** Like the shipped directory picker, browsing is not restricted to the
  workspace. This is a local developer tool, not a sandbox boundary: anything the dsh host process
  can read, the panel can read.
- **Paths travel in the query string** (`?path=...`), so they land in browser history and any host
  request logging you enable.
- The plugin stores only `{ open, width, lastPath }` in `localStorage`, and nothing leaves the machine.

## Development

There is no build step. Edit `lib/client.js` or `lib/index.js`, then:

```sh
npm run check   # node --check on both halves
```

and refresh the browser tab. With `~/.dsh/profiles/web/cordis.patch.yml` as the layer, host edits
need a `dsh` restart (module ESM is not hot-swapped); client edits only need a page refresh.

## Limitations

- Windows hidden entries are dot-prefixed only (Node dirents do not expose `FILE_ATTRIBUTE_HIDDEN`).
- Levels wider than 800 entries skip per-row `stat`, so those rows show no size.
- No search, no multi-select, no file operations.
- The panel is a single global dock: it follows the current session, it does not show a separate
  panel per session.

## License

MIT — see `LICENSE`.
