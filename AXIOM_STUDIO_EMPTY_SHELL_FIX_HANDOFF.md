# Axiom Studio — "Empty Shell on Install" Fix Handoff

**Repo:** `cryptocreeper94-sudo/axiomstudio`
**Affected files:** `package.json` (electron-builder config)
**Priority:** Critical — this is the actual root cause, not the blue-screen bug fixed in earlier handoffs.

---

## ROOT CAUSE

`electron/main.ts` has this helper, used for the splash screen, window icon, and tray icon:

```typescript
function getResourcePath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build');
  }
  return path.join(__dirname, '../../build');
}
```

In a packaged app, `process.resourcesPath` points to the `resources/` folder that sits *next to* `app.asar` — it is **not** inside the asar. Files only land there if they're declared under electron-builder's `extraResources`.

But `package.json` currently bundles the `build/` folder (which contains `splash.html`, `icon.png`, `icon.ico`) through `"files"`:

```json
"files": [
  "dist/**/*",
  "public/**/*",
  "build/**/*",
  "package.json"
]
```

`"files"` packs everything into `app.asar`. So in the installed app, `build/splash.html` actually lives at `resources/app.asar/build/splash.html` — but `getResourcePath()` looks for it at `resources/build/splash.html`, which doesn't exist.

Result: the first thing the user sees on launch — the splash window — calls `loadFile()` on a path that doesn't exist, so it opens as a blank window. If the main server takes any time to start, this blank splash sits there looking like the whole app is an empty shell. Same issue silently breaks the window icon and tray icon.

## FIX

Move `build/**/*` out of `"files"` and into a proper `"extraResources"` block, which is electron-builder's mechanism for placing files directly under `resources/` (matching what `getResourcePath()` already expects — no main.ts changes needed).

**In `package.json`, under `"build"`:**

Before:
```json
"build": {
    "appId": "dev.axiomstudio.app",
    "publish": { ... },
    "productName": "Axiom Studio",
    "directories": {
      "output": "release"
    },
    "asarUnpack": [
      "**/*.node",
      "dist/public/**/*"
    ],
    "files": [
      "dist/**/*",
      "public/**/*",
      "build/**/*",
      "package.json"
    ],
    ...
}
```

After:
```json
"build": {
    "appId": "dev.axiomstudio.app",
    "publish": { ... },
    "productName": "Axiom Studio",
    "directories": {
      "output": "release"
    },
    "asarUnpack": [
      "**/*.node",
      "dist/public/**/*"
    ],
    "files": [
      "dist/**/*",
      "public/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "build",
        "to": "build",
        "filter": ["**/*"]
      }
    ],
    ...
}
```

That's the only change needed — `build/` is removed from `"files"` (so it stops being packed inside the asar) and added as `"extraResources"` (so it's copied directly to `resources/build/`, exactly where `getResourcePath()` already looks).

## WHY THIS IS SAFE

No code in `electron/main.ts` changes. `getResourcePath()` was already written correctly for this setup — it was the packaging config that never matched it. This only affects how the installer packs static assets; no server, routing, or agent logic is touched.

## VERIFICATION

1. Run `npm run electron:build`.
2. Install the resulting `.exe` (or run it directly from `release/`) on a clean machine/folder — not `electron:dev`, the actual packaged installer.
3. Launch Axiom Studio.
4. Before the fix: splash window opens blank/empty, app never progresses past it (or main window is also missing its icon).
5. After the fix: splash screen shows the "AXIOM STUDIO" logo and loading bar, then closes and the full IDE loads once the server responds to `/api/health`. Taskbar/window icon and tray icon should also now display correctly.
