# Axiom / Cortex Ecosystem — Distribution Strategy Handoff

**Author:** Claude (Anthropic)  
**For:** Gemini Implementation Agent  
**Date:** June 21, 2026  
**Status:** Approved by Jason Andrews (DarkWave Studios LLC)

---

## What This Document Is

This is the agreed, finalized distribution strategy for the DarkWave Studios product ecosystem. Do not deviate from this plan. Do not propose alternatives. Do not introduce code signing, new app stores, or distribution mechanisms not listed here. If you have questions, ask Jason before implementing.

---

## The Core Architecture (Read This First)

**Cortex is the front door. Everything lives inside it.**

Cortex is the OS-level user nexus for the entire DarkWave Studios ecosystem. Users do not download standalone apps. Users join Cortex. Once inside, they get access to the native tools. This is intentional product design — not a workaround.

There is no cold public `.exe` download page anywhere in this ecosystem.

---

## The Product Stack

| Product | Type | Distribution Method |
|---|---|---|
| **LUME-Cortex** | Cloud/web OS | Web browser — users sign up here first |
| **Axiom Studio** | Electron `.exe` | In-app only — accessible through Cortex |
| **Axiom42Suite** | Electron `.exe` | In-app only — accessible through Cortex |
| **TrustGen-3D** | Electron `.exe` | In-app only — accessible through Cortex |
| **Axiom News** | Web | Web — no installer needed |
| **gov.tlid.io / NDIP** | Web | Web — no installer needed |

---

## Code Signing — Decision Made

**No EV code signing certificate will be purchased for launch.** This decision is final.

**Why it's not needed:**
- Every `.exe` (Axiom Studio, Axiom42Suite, TrustGen-3D) is distributed exclusively through Cortex to authenticated users
- Users are already inside the ecosystem before any download is triggered
- SmartScreen bypass instructions ("Click More Info → Run Anyway") are presented in-context inside Cortex, in a polished branded UI, immediately before any download
- Authenticated, opted-in power users handle this without issue — it is standard behavior for developer-grade tools

**Do not implement any code signing workflow.** Do not purchase or configure certificates. Do not add signing steps to any build pipeline.

---

## Current State of Cortex

**Cortex is already live.** It has existing `.exe` and `.apk` builds in production. Do not rebuild it. Do not replace it. Work with what exists.

The discussion in this handoff may inform changes to how those builds are distributed (moving away from public direct downloads toward the in-app ecosystem model described below), but Cortex itself is not a greenfield project.

---

## What Needs to Be Built / Changed

### Priority 1 — PWA Configuration
- Configure `vite-plugin-pwa` so Cortex prompts users to install it as a desktop app via Chrome/Edge
- PWA install creates a native desktop shortcut, runs in standalone window, bypasses SmartScreen entirely
- This is the primary "desktop feel" experience for users who don't need local execution

### Priority 3 — In-App Download Flow (Inside Cortex)
- When an authenticated user requests Axiom Studio, Axiom42Suite, or TrustGen-3D:
  1. Show a branded install modal explaining what they're about to download
  2. Include clear SmartScreen bypass instructions:
     > *"Axiom Studio is a local execution engine. Windows will show a security prompt for unrecognized developer tools. When prompted, click **More Info → Run Anyway** to install."*
  3. Then trigger the download from GitHub Releases
- Style this as an intentional, premium, developer-exclusive experience — not an apology

### Priority 4 — GitHub Releases
- Host all `.exe` files on GitHub Releases (private or public repo, Jason's call)
- Tag each release properly for `electron-updater` auto-update support
- Ensure `latest.yml` is present in release assets for each Electron app

---

## What NOT to Build

- No public download page with an unsigned `.exe` link
- No code signing pipeline
- No alternative app store submissions (Microsoft Store, etc.)
- No Google Play Store submission for any APK
- No standalone marketing landing page for individual apps — everything routes through Cortex

---

## Remaining Known Issues (From Prior Handoff)

Before Axiom Studio is made available inside Cortex, these two cleanup items from the Electron fix session need to be resolved:

1. **Unused `screen` import in `window-state.ts`** — will cause a TypeScript TS6133 build failure. Remove the import.
2. **Duplicate `waitForServer()` calls** — verify there is only one call in the startup sequence.
3. **node-pty graceful degradation** — confirm the terminal panel shows a clean error message if node-pty fails to load, rather than a silent broken panel.

---

## Summary

Cortex is the product. The native apps are features of the ecosystem. Users join the OS — they don't download standalone apps. The SmartScreen bypass is handled gracefully inside the authenticated Cortex experience. No signing certificate is needed at launch.

Build Cortex first. Everything else flows from it.
