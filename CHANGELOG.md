# Changelog

## 0.2.0

- The panel is now **docked to the right edge** instead of a centred modal window:
  opening it adds `padding-right` to `body`, so the app's three-column grid narrows
  and nothing is covered.
- Width is drag-resizable (280-760 px), the panel collapses to a 40 px rail, and
  width / expanded state / last directory persist in `localStorage`.
- The panel **follows the current workspace**: it opens in the current session's
  `cwd` (falling back to the most recently used Workspace, then the host process
  directory) and jumps automatically whenever that target changes.
- Clicking a file hands it to the **operating system's default application** and
  previews its text in the panel at the same time.
- Added a footer action that opens the current directory in the system file manager.
- The sidebar footer trigger is gone: the dock is always visible.
- Ships a `dsh.bundle` layer, so `dsh plugin add` wires the profile row automatically.
- Adds `scripts/verify.mjs` (`npm run check`): manifest, bundle layer and client-bundle contract
  checks plus syntax parsing, dependency-free; CI runs it on every push and pull request.
- Adds a screenshot (`docs/screenshot.png`) to both READMEs.

## 0.1.0

- First working version: sidebar footer trigger plus a centred floating window with
  breadcrumbs, one directory level, and a read-only text preview.
- Node half registers the read-only `/file-manager/api/{root,list,read}` surface.
