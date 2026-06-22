# LumeCortex — Sweep 2 Punch List
**Date:** June 21, 2026  
**Verified by:** Claude against latest commit `b95724d`

Five specific fixes. Apply all of them, then `git add -A && git commit -m "fix: sweep 2 cleanup" && git push origin main`.

---

## Fix 1 — Axiom42Suite URL still points to trustvault.studio

**File:** `src/lume/03_shell.lume`

Find this line:
```javascript
{ name: 'Axiom42Suite', icon: '🔐', url: 'https://trustvault.studio', featured: true, nativeInstall: true, downloadUrl: 'https://github.com/cryptocreeper94-sudo/Axiom42Suite/releases/latest/download/Axiom42Suite-Setup.exe' },
```

Change `url: 'https://trustvault.studio'` to `url: 'https://axiom42suite.com'`

Result:
```javascript
{ name: 'Axiom42Suite', icon: '🔐', url: 'https://axiom42suite.com', featured: true, nativeInstall: true, downloadUrl: 'https://github.com/cryptocreeper94-sudo/Axiom42Suite/releases/latest/download/Axiom42Suite-Setup.exe' },
```

---

## Fix 2 — Ecosystem registry still shows TrustVault

**File:** `src/lume/11_ecosystem.lume`

Find:
```javascript
{ id: 'trustvault',  name: 'TrustVault',      icon: '🔐', domain: 'trustvault.studio',     tier: 'paid',  category: 'security', status: 'preview', desc: 'AES-256 Media Vault' },
```

Replace with:
```javascript
{ id: 'axiom42suite', name: 'Axiom42Suite',   icon: '🔐', domain: 'axiom42suite.com',      tier: 'paid',  category: 'security', status: 'preview', desc: 'AES-256 Media Vault' },
```

Also update the two orchestration presets in the same file that reference `'trustvault'` in their `apps` arrays — change `'trustvault'` to `'axiom42suite'` in both.

---

## Fix 3 — REPL example code still shows TrustVault

**File:** `src/lume/11b_repl_knowledge.lume` line 28

Inside the `code` string, find:
```
{ name: "TrustVault", tier: "pro", status: "preview" }
```

Change to:
```
{ name: "Axiom42Suite", tier: "pro", status: "preview" }
```

---

## Fix 4 — PWA install uses alert() instead of showToast()

**File:** `src/lume/12_init.lume`

Find:
```javascript
if (result.outcome === 'accepted') alert('LumeCortex installed to your desktop')
```

Replace with:
```javascript
if (result.outcome === 'accepted') showToast('✓ LumeCortex installed to your desktop')
```

---

## Fix 5 — GitHub Actions still building Windows .exe

**File:** `.github/workflows/hybrid-build.yml`

Remove the entire `build-windows` job. The file should end after the `build-android` job. Final file:

```yaml
name: Build Hybrid App
on:
  push:
    branches: [ "main" ]
  workflow_dispatch:
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm install
      - run: npm run eas-build-pre-build || npx cap sync android
        continue-on-error: true
      - uses: actions/setup-java@v4
        with: { java-version: '17', distribution: 'temurin' }
      - uses: android-actions/setup-android@v3
      - name: Build Android APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleRelease --no-daemon
      - uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: android/app/build/outputs/apk/release/*.apk
```

---

## Fix 6 — README architecture diagram shows old metrics

**File:** `README.md`

Find this block in the architecture diagram:
```
│         │ Axiom DLA│  60,600 topics          │
│         │  Kernel  │  74 domains             │
```

Replace with:
```
│         │ Axiom DLA│  181,282 topics         │
│         │  Kernel  │  149 domains            │
```

---

## After All Fixes

```bash
git add -A
git commit -m "fix: sweep 2 — axiom42suite urls, trustvault rename, pwa toast, disable windows build, readme metrics"
git push origin main
```

Do not mark this complete until you confirm the push succeeded.
