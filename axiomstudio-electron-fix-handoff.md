# Axiom Studio — Electron Fix & Gap Resolution Handoff
**Agent:** Gemini (or any LLM with file edit capability)
**Owner:** Jason Andrews — DarkWave Studios LLC
**Repo:** https://github.com/cryptocreeper94-sudo/AxiomStudio (branch: main)
**Local path:** D:\axiom-studio\ (or wherever cloned)
**Date:** June 2026
**Priority:** Fix blue screen first. Then implement gaps in order.

---

> READ THIS ENTIRE DOCUMENT BEFORE WRITING ANY CODE.
> All changes must work on BOTH cloud (Render/Vercel) AND local (Electron) builds.
> Do NOT break existing streaming, agent routing, Firebase auth, or terminal functionality.
> Run `npx vite build && npx tsc -p tsconfig.server.json` after every change. Fix all TypeScript errors before committing.

---

## CONFIRMED BUGS — FIX THESE FIRST

---

### BUG 1 — Blue Screen on Launch (PRIMARY ISSUE)
**File:** `electron/main.ts`
**Severity:** Critical — product-breaking

**Root cause:**
`show: false` is set on the BrowserWindow but then immediately overridden with
`mainWindow.show()` BEFORE the URL loads. The window appears blank/dark for 2+
seconds on every launch. If the server is slow to start, it shows nothing for
much longer while `tryLoadURL` retries silently.

**Current broken code:**
```typescript
mainWindow = new BrowserWindow({
  show: false,           // <-- set hidden
  backgroundColor: '#0d1117',
  // ...
});

mainWindow.show();       // <-- immediately shown with nothing loaded
setTimeout(tryLoadURL, 2000);  // URL loads 2 seconds later
```

**Fix — use the ready-to-show event:**
```typescript
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Axiom Studio",
    icon: path.join(getResourcePath(), 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),  // add preload (see Bug 3)
    },
    show: false,                    // keep false — let ready-to-show handle it
    backgroundColor: '#0d1117',
  });

  mainWindow.setMenuBarVisibility(false);

  const port = process.env.PORT || '5100';

  // Replace blind setTimeout with health check poll
  waitForServer(port).then((ready) => {
    if (!ready) {
      dialog.showErrorBox(
        'Axiom Studio — Server Error',
        'The background server failed to start. Please restart Axiom Studio.\n\nIf this keeps happening, check that port 5100 is not in use.'
      );
      app.quit();
      return;
    }
    if (mainWindow) {
      mainWindow.loadURL(`http://localhost:${port}/`);
    }
  });

  // Show window only when content is painted — eliminates blue screen
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes('firebaseapp.com') ||
      url.includes('accounts.google.com') ||
      url.includes('github.com/login') ||
      url.includes('trustlayer') ||
      url.includes(`localhost:${port}`)
    ) {
      return { action: 'allow' };
    }
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Add this helper function to electron/main.ts
async function waitForServer(port: string, maxAttempts = 40): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/api/health`);
      if (res.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

// Add this helper for cross-context resource paths
function getResourcePath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build');
  }
  return path.join(__dirname, '../../build');
}
```

Also add a health check endpoint to `server/local-index.ts` (add near the top of routes):
```typescript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'local', timestamp: Date.now() });
});
```

---

### BUG 2 — Icon Missing in Packaged Build (causes crash or broken icon)
**File:** `package.json` → `build.files`
**Severity:** High

**Root cause:**
The `build/` folder containing `icon.png` and `icon.ico` is not included in
electron-builder's file list. The packaged `.exe` cannot find the icon.

**Current broken config:**
```json
"files": [
  "dist/**/*",
  "public/**/*",
  "package.json"
]
```

**Fix:**
```json
"files": [
  "dist/**/*",
  "public/**/*",
  "build/**/*",
  "package.json"
]
```

Also update icon path in `electron/main.ts` to use `getResourcePath()` as shown
in Bug 1 fix above. Do NOT use `path.join(__dirname, '../../build/icon.png')`
in a packaged build — `__dirname` inside an asar points to the wrong location.

---

### BUG 3 — No Preload Script With contextIsolation Enabled
**File:** `electron/main.ts` + create `electron/preload.ts`
**Severity:** High — IPC will silently fail without this

**Root cause:**
`contextIsolation: true` is set but no `preload` script is defined. Any
renderer-to-main IPC (terminal events, file system alerts, server status) cannot
be safely passed across the context boundary without a preload.

**Fix — create `electron/preload.ts`:**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Server status
  onServerReady: (callback: () => void) =>
    ipcRenderer.on('server-ready', callback),

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => process.platform,

  // Check if running in Electron
  isElectron: true,
});
```

Add to `tsconfig.server.json` includes if not already present:
```json
"include": ["server/**/*", "shared/**/*", "electron/**/*"]
```

Add IPC handlers in `electron/main.ts`:
```typescript
import { ipcMain } from 'electron';

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());
ipcMain.handle('get-version', () => app.getVersion());
```

---

### BUG 4 — Server Crash Has No Recovery Path
**File:** `electron/main.ts`
**Severity:** Medium

**Root cause:**
If `local-index.js` crashes mid-session, the app goes blue/blank with no
indication to the user and no recovery. The `uncaughtException` handler only
shows a dialog and the process dies.

**Fix — add server process monitoring:**
```typescript
// Track server startup with a recoverable pattern
let serverStartAttempts = 0;
const MAX_SERVER_RESTARTS = 3;

async function startServer(): Promise<void> {
  try {
    await import('../server/local-index.js');
  } catch (err: any) {
    serverStartAttempts++;
    console.error(`Server start attempt ${serverStartAttempts} failed:`, err);

    if (serverStartAttempts < MAX_SERVER_RESTARTS) {
      console.log(`Retrying server start in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
      return startServer();
    }

    dialog.showErrorBox(
      'Axiom Studio — Server Failed',
      `The background server could not start after ${MAX_SERVER_RESTARTS} attempts.\n\n${err.toString()}`
    );
    app.quit();
  }
}

// In app.whenReady():
app.whenReady().then(async () => {
  await startServer();
  createWindow();
  // ...
});
```

---

## FEATURE GAPS — IMPLEMENT AFTER BUGS ARE FIXED

---

### GAP 1 — No Splash Screen During Server Startup
**Priority:** High — UX impact

Users currently see a black window (or nothing) while the server cold-starts.
The server loads Anthropic SDK, OpenAI, Firebase, JWT, SQLite, PTY, and multiple
route files — this can take 3-8 seconds on first launch.

**Fix — add `build/splash.html`:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0d1117;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: 'Inter', system-ui, sans-serif;
      color: #e6edf3;
    }
    .logo { font-size: 28px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px; }
    .logo span { color: #22d3ee; }
    .sub { font-size: 12px; color: #8b949e; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 32px; }
    .bar-track { width: 200px; height: 2px; background: #21262d; border-radius: 2px; }
    .bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #22d3ee, #818cf8);
      border-radius: 2px;
      animation: load 3s ease-in-out forwards;
    }
    @keyframes load { to { width: 85%; } }
    .status { font-size: 11px; color: #8b949e; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="logo">AXIOM <span>STUDIO</span></div>
  <div class="sub">DarkWave Studios LLC</div>
  <div class="bar-track"><div class="bar-fill"></div></div>
  <div class="status">Initializing local engine...</div>
</body>
</html>
```

**In `electron/main.ts` — show splash, then swap to main:**
```typescript
let splashWindow: BrowserWindow | null = null;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 280,
    frame: false,
    transparent: false,
    resizable: false,
    center: true,
    backgroundColor: '#0d1117',
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false }
  });
  splashWindow.loadFile(path.join(getResourcePath(), 'splash.html'));
  splashWindow.show();
}

// In app.whenReady():
app.whenReady().then(async () => {
  createSplash();
  await startServer();
  createWindow();

  const ready = await waitForServer(process.env.PORT || '5100');
  if (ready) {
    splashWindow?.close();
    splashWindow = null;
  }
});
```

Add `build/splash.html` to electron-builder files (already covered in Bug 2 fix).

---

### GAP 2 — No Window State Persistence
**Priority:** Medium

The window opens at 1280x800 every launch regardless of where the user left it.
Window size, position, and maximized state should persist between sessions.

**Fix — add `electron/window-state.ts`:**
```typescript
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const DEFAULTS: WindowState = { width: 1280, height: 800, isMaximized: false };

export function loadWindowState(): WindowState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) };
    }
  } catch {}
  return DEFAULTS;
}

export function saveWindowState(win: BrowserWindow): void {
  try {
    const state: WindowState = win.isMaximized()
      ? { ...loadWindowState(), isMaximized: true }
      : { ...win.getBounds(), isMaximized: false };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch {}
}

export function applyWindowState(win: BrowserWindow, state: WindowState): void {
  if (state.isMaximized) win.maximize();
  if (state.x !== undefined && state.y !== undefined) win.setPosition(state.x, state.y);
}
```

**In `electron/main.ts`:**
```typescript
import { loadWindowState, saveWindowState, applyWindowState } from './window-state.js';

function createWindow() {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    // x and y applied after creation to avoid multi-monitor edge cases
    // ...existing options...
  });

  applyWindowState(mainWindow, state);

  mainWindow.on('close', () => {
    if (mainWindow) saveWindowState(mainWindow);
  });
}
```

---

### GAP 3 — No System Tray (App Disappears When Minimized)
**Priority:** Medium

When the user closes or minimizes the window, the app exits entirely. For a
local AI coding environment, keeping it running in the background (tray) is
standard behavior.

**Fix — add tray to `electron/main.ts`:**
```typescript
import { Tray, Menu, nativeImage } from 'electron';

let tray: Tray | null = null;

function createTray() {
  const icon = nativeImage.createFromPath(path.join(getResourcePath(), 'icon.png'))
    .resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  tray.setToolTip('Axiom Studio');

  const menu = Menu.buildFromTemplate([
    { label: 'Open Axiom Studio', click: () => {
      mainWindow?.show();
      mainWindow?.focus();
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setContextMenu(menu);
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// In app.whenReady():
createTray();

// Update window-all-closed to minimize to tray instead of quitting:
app.on('window-all-closed', () => {
  // Don't quit — stay alive in tray
  // Only quit on darwin if no windows (standard macOS behavior)
  if (process.platform === 'darwin') app.quit();
});

// In createWindow() — intercept close to minimize to tray:
mainWindow.on('close', (e) => {
  if (tray) {
    e.preventDefault();
    mainWindow?.hide();
  }
});
```

---

### GAP 4 — No Auto-Updater
**Priority:** Medium — you have 6 tags and 198 commits, users re-download manually

With `electron-builder`, `electron-updater` is a one-package addition that
notifies users of new releases and installs them automatically.

**Install:**
```
npm install electron-updater
```

**Add to `electron/main.ts`:**
```typescript
import { autoUpdater } from 'electron-updater';

app.whenReady().then(async () => {
  // ... existing startup ...

  // Check for updates 5 seconds after launch (don't block startup)
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 5000);
});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'A new version of Axiom Studio is available. It will be downloaded in the background.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version of Axiom Studio has been downloaded. Restart to apply the update.',
    buttons: ['Restart Now', 'Later']
  }).then(result => {
    if (result.response === 0) autoUpdater.quitAndInstall();
  });
});
```

**Add to `package.json` build config:**
```json
"publish": {
  "provider": "github",
  "owner": "cryptocreeper94-sudo",
  "repo": "AxiomStudio"
}
```

For auto-updater to work, releases must be published to GitHub Releases with
the correct assets. Tag a release on GitHub with the `.exe` and `.yml` files
that `electron-builder` generates in the `release/` folder.

---

### GAP 5 — No Renderer-Side Error State When Server Fails
**Priority:** Medium

If the server never starts (missing API key, port conflict, etc.), the renderer
loads `http://localhost:5100` and gets a connection refused error. The user sees
a Chrome error page — not a branded Axiom Studio experience.

**Fix — add a loading/error overlay to `client/index.html`:**
```html
<!-- Add before closing </body> tag in client/index.html -->
<div id="electron-startup-overlay" style="
  display: none;
  position: fixed;
  inset: 0;
  background: #0d1117;
  z-index: 99999;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Inter, system-ui, sans-serif;
  color: #e6edf3;
">
  <div style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    AXIOM <span style="color:#22d3ee">STUDIO</span>
  </div>
  <div id="electron-startup-status" style="font-size: 12px; color: #8b949e; margin-bottom: 24px;">
    Starting local engine...
  </div>
</div>

<script>
  // Show overlay if running in Electron and app takes too long to load
  if (navigator.userAgent.includes('Electron')) {
    const overlay = document.getElementById('electron-startup-overlay');
    overlay.style.display = 'flex';
    // Hide once React mounts
    window.__axiomReady = () => { overlay.style.display = 'none'; };
    // Timeout: show error message if not ready in 15s
    setTimeout(() => {
      const status = document.getElementById('electron-startup-status');
      if (status && overlay.style.display !== 'none') {
        status.textContent = 'Engine is taking longer than expected. Check that port 5100 is available.';
        status.style.color = '#f87171';
      }
    }, 15000);
  }
</script>
```

**In `client/src/main.tsx` — signal when React is ready:**
```typescript
// After ReactDOM.createRoot render call:
if ((window as any).__axiomReady) {
  (window as any).__axiomReady();
}
```

---

### GAP 6 — IS_OWNER_MODE Hardcoded True (Paywall Bypassed)
**File:** `server/local-index.ts`
**Priority:** Low (intentional for personal use, critical before public release)

```typescript
const IS_OWNER_MODE = true; // FORCED TO TRUE TO BYPASS PAYWALL
```

This means any user who installs the `.exe` gets unlimited owner-mode access
regardless of credentials. Fine for personal builds. Before any public
distribution, this line must be removed and the tenant mode logic re-enabled:

```typescript
// Replace with:
const IS_OWNER_MODE = HAS_OWN_KEYS;
```

Flag this with a comment so it's not forgotten:
```typescript
// ⚠️  DISTRIBUTION NOTE: Remove the override below before public release.
// In public builds, IS_OWNER_MODE should be derived from HAS_OWN_KEYS.
const IS_OWNER_MODE = true; // TEMPORARY — owner personal build only
```

---

### GAP 7 — node-pty Fails Silently If Not Installed
**File:** `server/pty.ts` (or wherever setupTerminalWebSocket is)
**Priority:** Medium

`node-pty` is listed as an optional dependency. If it fails to install (common
on Windows without build tools), the terminal panel silently does nothing. Users
think the terminal is broken with no error shown.

**Fix — add graceful degradation in the terminal route:**
```typescript
let ptyAvailable = false;
try {
  await import('node-pty');
  ptyAvailable = true;
} catch {
  console.warn('node-pty not available — terminal panel will be disabled');
}

export function setupTerminalWebSocket(server: any) {
  if (!ptyAvailable) {
    // Emit a message to connected clients that terminal is unavailable
    server.on('connection', (ws: any) => {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Terminal requires native build tools. Run: npm rebuild node-pty'
      }));
    });
    return;
  }
  // ... existing pty setup ...
}
```

---

## BUILD & TEST INSTRUCTIONS FOR AGENT

After making all changes:

**1. TypeScript check:**
```
npx tsc --noEmit
npx tsc -p tsconfig.server.json --noEmit
```

**2. Build:**
```
npm run build
```
This runs: `npx vite build && npx tsc -p tsconfig.server.json`

**3. Test Electron in dev mode:**
```
npm run electron:dev
```
Expected: splash screen appears, server starts, splash closes, main window loads
WITHOUT a blue screen. Window should not appear until content is painted.

**4. Build installer:**
```
npm run electron:build
```
Expected: `release/Axiom Studio Setup.exe` produced without icon errors.

**5. Verify auto-deploy (GitHub → Render) still works:**
Push to main branch. Confirm Render build succeeds. The Electron changes do not
affect the cloud/web build.

---

## FILE CHANGE SUMMARY

| File | Action | Reason |
|---|---|---|
| `electron/main.ts` | Modify | Fix ready-to-show, add waitForServer, splash, tray, auto-updater, IPC handlers, getResourcePath |
| `electron/preload.ts` | Create | Required for contextIsolation IPC |
| `electron/window-state.ts` | Create | Persist window size/position |
| `build/splash.html` | Create | Splash screen during server startup |
| `package.json` | Modify | Add build/**, add publish config, add electron-updater dep |
| `server/local-index.ts` | Modify | Add /api/health endpoint, flag IS_OWNER_MODE |
| `client/index.html` | Modify | Add renderer-side loading/error overlay |
| `client/src/main.tsx` | Modify | Signal __axiomReady after React mount |

---

## RULES FOR THIS AGENT

1. Fix bugs in order: Bug 1 → Bug 2 → Bug 3 → Bug 4 before touching gaps.
2. Do not modify any agent routing, credit, or Firebase auth logic.
3. Do not change the cloud server (server/index.ts) — only local-index.ts and electron/*.
4. Run `npm run build` after every file change. Zero TypeScript errors before commit.
5. The splash screen must match the dark aesthetic: #0d1117 background, #22d3ee accent.
6. Do not add any new npm dependencies beyond `electron-updater`.
7. Commit message format: `fix: [what was fixed]` or `feat: [what was added]`

---

*Handoff prepared by DarkWave Studios LLC — June 2026*
*Companion repo HANDOFF.md contains broader product context and agent history.*
