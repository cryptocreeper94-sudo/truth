# Chronicles — Extraction Handoff: trust-layer → Standalone Repo

**Source repo:** Cryptocreeper94-sudo/trust-layer (`client/src/`)  
**Target repo:** Cryptocreeper94-sudo/chronicles  
**Date:** March 25, 2026  
**Purpose:** The real Chronicles build lives inside trust-layer. The standalone chronicles repo is an early skeleton with placeholder shells. This document instructs the agent to extract the full build from trust-layer and make chronicles its own self-contained repo.

---

## Background

Chronicles has been built inside trust-layer because that's where development was happening. The standalone `chronicles` repo was created with the intention of separating it, but only has 3 commits — a skeleton with the right folder structure but 37 of 43 routes as 17-line placeholder shells saying "This module is wired and ready. Connect to the backend to see live data."

The trust-layer version has the real implementations:

| Page | Standalone (current) | Trust-Layer (source of truth) |
|---|---|---|
| `chronicles-play` | 120 lines | 741 lines |
| `chronicles-npc-chat` | 18-line shell | 386 lines — fully built |
| `chronicles-world` | 18-line shell | 552 lines — fully built |
| `era-codex` | 17-line shell | 368 lines — fully built |
| All other routes | 17-line shells | Full implementations |

Plus entire component systems that don't exist in standalone at all (see below).

---

## What's Already in the Standalone Repo — Do Not Touch

Before starting, the agent should know these assets are **already in the standalone chronicles repo and do not need to be moved**. They were generated from TrustGen recipes by `scripts/generate-glbs.ts` and committed directly.

### 3D GLB Assets — 85 files across 3 era folders in `public/models/`

**`public/models/medieval/` — 28 files:**
`env-med-anvil.glb`, `env-med-archery.glb`, `env-med-banner.glb`, `env-med-barrel.glb`, `env-med-bridge.glb`, `env-med-chapel.glb`, `env-med-chest.glb`, `env-med-cottage.glb`, `env-med-crate.glb`, `env-med-forge.glb`, `env-med-guardtower.glb`, `env-med-haycart.glb`, `env-med-horse.glb`, `env-med-keep.glb`, `env-med-market.glb`, `env-med-oak.glb`, `env-med-oxcart.glb`, `env-med-pine.glb`, `env-med-scarecrow.glb`, `env-med-stones.glb`, `env-med-swordstone.glb`, `env-med-tavern.glb`, `env-med-taverntable.glb`, `env-med-torch.glb`, `env-med-wagon.glb`, `env-med-wall.glb`, `env-med-weaponrack.glb`, `env-med-well.glb`

**`public/models/modern/` — 30 files:**
`env-mod-airplane.glb`, `env-mod-apartment.glb`, `env-mod-bench.glb`, `env-mod-bookshelf.glb`, `env-mod-bus.glb`, `env-mod-busstop.glb`, `env-mod-cafe.glb`, `env-mod-cafetable.glb`, `env-mod-cherry.glb`, `env-mod-desk.glb`, `env-mod-gazebo.glb`, `env-mod-grass.glb`, `env-mod-gym.glb`, `env-mod-gymequip.glb`, `env-mod-hedge.glb`, `env-mod-helicopter.glb`, `env-mod-hydrant.glb`, `env-mod-library.glb`, `env-mod-mailbox.glb`, `env-mod-mall.glb`, `env-mod-newsbox.glb`, `env-mod-oak.glb`, `env-mod-office-tower.glb`, `env-mod-planter.glb`, `env-mod-restaurant.glb`, `env-mod-sedan.glb`, `env-mod-sofa.glb`, `env-mod-streetlight.glb`, `env-mod-trashcan.glb`, `env-mod-van.glb`

**`public/models/wild-west/` — 27 files:**
`env-ww-barn.glb`, `env-ww-barrel-cactus.glb`, `env-ww-cabin.glb`, `env-ww-campfire.glb`, `env-ww-dynamite.glb`, `env-ww-fence.glb`, `env-ww-generalstore.glb`, `env-ww-handcar.glb`, `env-ww-hitchpost.glb`, `env-ww-horse.glb`, `env-ww-joshua.glb`, `env-ww-minecart.glb`, `env-ww-mining.glb`, `env-ww-pokertable.glb`, `env-ww-rocks.glb`, `env-ww-saguaro.glb`, `env-ww-saloon.glb`, `env-ww-sheriff.glb`, `env-ww-stagecoach.glb`, `env-ww-station.glb`, `env-ww-trough.glb`, `env-ww-tumbleweed.glb`, `env-ww-wagon.glb`, `env-ww-wanted.glb`, `env-ww-watertower.glb`, `env-ww-whiskey.glb`, `env-ww-windmill.glb`

### Video Assets — already in `public/videos/`
Era cinematic clips (medieval castle, wild west frontier, ancient Rome colosseum, Victorian London, ancient Egypt pyramids) are already committed in the standalone repo.

**The 3D engine (`assets.tsx`) loads GLBs via `GLTFLoader` with a cache layer and automatic fallback to procedural placeholder geometry if any file is missing — so the scene will not break if a model fails to load.**

The agent's job is **code only** — assets are already in place.

---

## What to Extract From trust-layer

All source paths are relative to `trust-layer/client/src/`.

### Pages — copy all of these to `chronicles/src/pages/`

Every file matching these patterns from `trust-layer/client/src/pages/`:

- `chronicles.tsx` — marketing landing (video hero carousel)
- `chronicles-admin.tsx`
- `chronicles-ai-demo.tsx`
- `chronicles-builder.tsx`
- `chronicles-city.tsx`
- `chronicles-daily-life.tsx`
- `chronicles-dashboard.tsx`
- `chronicles-demo.tsx`
- `chronicles-estate.tsx`
- `chronicles-executive-summary.tsx`
- `chronicles-faith.tsx`
- `chronicles-hub.tsx`
- `chronicles-interior.tsx`
- `chronicles-life.tsx`
- `chronicles-locked.tsx`
- `chronicles-login.tsx`
- `chronicles-marketplace.tsx`
- `chronicles-npc-chat.tsx`
- `chronicles-onboarding.tsx`
- `chronicles-pets.tsx`
- `chronicles-play.tsx`
- `chronicles-portal-entry.tsx`
- `chronicles-season-hub.tsx`
- `chronicles-time-portal.tsx`
- `chronicles-travel.tsx`
- `chronicles-tutorial.tsx`
- `chronicles-voice.tsx`
- `chronicles-world.tsx`
- `chrono-community.tsx`
- `chrono-creators.tsx`
- `chrono-dashboard.tsx`
- `chrono-economy.tsx`
- `chrono-eras.tsx`
- `chrono-gameplay.tsx`
- `chrono-home.tsx`
- `chrono-roadmap.tsx`
- `chrono-team.tsx`
- `chronochat-invite.tsx`
- `chronochat.tsx`
- `era-codex.tsx`
- `roadmap-chronicles.tsx`
- `scenario-generator.tsx`
- `build-your-legacy.tsx`

### Components — copy these to `chronicles/src/components/`

**Replace** the existing `chronicles-3d/` directory entirely with the trust-layer version — it has more files:

From `trust-layer/client/src/components/chronicles-3d/`:
- `assets.tsx` ← new, doesn't exist in standalone
- `camera.tsx` ← new, doesn't exist in standalone
- `engine.tsx` ← updated version
- `index.ts`
- `overlay.tsx` ← new, doesn't exist in standalone
- `scenes.tsx` ← updated version
- `types.ts`

**Add** the entire `chronicles/` component directory — doesn't exist in standalone at all:

From `trust-layer/client/src/components/chronicles/`:
- `CharacterCreator.tsx`
- `DialogueInterface.tsx`
- `EmotionAxes.tsx`
- `EraSelector.tsx`
- `index.ts`

**Add** these standalone component files from `trust-layer/client/src/components/`:
- `chronicles-npc.tsx`
- `chronicles-chat-panel.tsx`
- `character-portrait.tsx`
- `chrono-ui.tsx`
- `glass-card.tsx` (used heavily across chronicles pages)

### Stores — update `chronicles/src/stores/`

The standalone already has `gameStore.ts`, `authStore.ts`, `shellStore.ts`. Check whether the trust-layer versions are more developed and replace if so:

- `trust-layer/client/src/` — look for equivalent store files and compare line counts

### Services — update `chronicles/src/services/`

The standalone `api.ts` is a basic 38-line client. The trust-layer version likely has more endpoints. Replace with the trust-layer version.

---

## Tech Stack Differences to Reconcile

The standalone and trust-layer use different libraries for the same jobs. The agent must reconcile these — **do not mix them**.

| Concern | Standalone (current) | Trust-Layer (source) | Decision |
|---|---|---|---|
| Routing | `react-router-dom` | `wouter` | Adopt `wouter` — it's what all the extracted pages use |
| Data fetching | none | `@tanstack/react-query` | Add React Query — all real pages depend on it |
| UI components | none | shadcn/ui (`@/components/ui/*`) | Add shadcn/ui — all real pages use Button, Badge, Card, Progress, Input, etc. |
| Path aliases | `../` relative | `@/` alias | Configure `@/` alias in `vite.config.ts` and `tsconfig.json` |
| Auth session | `localStorage` token | `getChroniclesSession()` from `chronicles-login` | Use the trust-layer pattern — it's already wired into all extracted pages |

### Steps to reconcile:

1. **Install missing dependencies:**
   ```bash
   npm install wouter @tanstack/react-query framer-motion
   ```

2. **Set up shadcn/ui** — the extracted pages import from `@/components/ui/button`, `badge`, `card`, `progress`, `input`, `toast`, `tooltip`. Either install shadcn/ui or copy the component files directly from trust-layer's `client/src/components/ui/`.

3. **Configure path alias** in `vite.config.ts`:
   ```ts
   resolve: {
     alias: { '@': path.resolve(__dirname, './src') }
   }
   ```
   And in `tsconfig.json`:
   ```json
   "paths": { "@/*": ["./src/*"] }
   ```

4. **Update `App.tsx`** — replace react-router-dom routes with wouter `Switch`/`Route` pattern matching the trust-layer App.tsx structure, but scoped to only the chronicles routes (not the full trust-layer route list).

5. **Set up React Query** — wrap the app in `QueryClientProvider` in `main.tsx`.

---

## The Backend Question — Decide Before Starting

The standalone chronicles repo has no server. The game store makes API calls (`generateScenario()`, `makeDecision()`, `loadGameState()`) to `VITE_API_BASE`. There are two options:

**Option A — Point at trust-layer's server (faster)**
Set `VITE_API_BASE` in the standalone's `.env` to trust-layer's deployed URL (dwtl.io). Chronicles becomes a frontend-only repo that uses trust-layer as its backend. Fastest path to a working standalone.

**Option B — Build a chronicles-specific backend (cleaner long-term)**
Add a `server/` directory to the standalone chronicles repo with the chronicles-specific routes (scenario generation, NPC chat, game state, session management). This makes chronicles truly self-contained but requires building the backend.

**Recommendation:** Start with Option A to get the standalone working quickly. Build Option B as the next phase once the frontend extraction is stable.

If going with Option A, add to `chronicles/.env`:
```
VITE_API_BASE=https://dwtl.io
```

---

## What the Standalone Already Has (Keep These)

- `src/App.tsx` — router structure (update routes, don't delete)
- `src/stores/authStore.ts` — check against trust-layer version, keep whichever is more complete
- `src/stores/gameStore.ts` — check against trust-layer version, keep whichever is more complete
- `vercel.json` — SPA rewrite config, keep as-is
- `vite.config.ts` — keep, add `@/` alias
- `tsconfig.json` — keep, add path alias
- `package.json` — keep, add missing deps

---

## Verification Checklist

After extraction, verify these before calling it done:

- [ ] `npm run build` completes without TypeScript errors
- [ ] All `@/components/ui/*` imports resolve (shadcn/ui installed or copied)
- [ ] All `@/` path aliases resolve
- [ ] `chronicles-play` route loads and shows the 3D engine canvas
- [ ] `chronicles-npc-chat` route loads and shows the chat interface (not the placeholder shell)
- [ ] `chronicles-world` route loads with the full world explorer (not the placeholder shell)
- [ ] Auth flow works — login page → session → hub
- [ ] `VITE_API_BASE` is set in `.env` and the game store is hitting the right endpoint
- [ ] Vercel deploy still works after changes (`vercel.json` rewrite intact)
- [ ] No references to trust-layer internal paths (`client/src/`) remain in the extracted code

---

## What NOT to Bring Over

Trust-layer has 200+ pages. Chronicles only needs the chronicles-specific pages. Do **not** pull over:

- DeFi pages (bridge, swap, staking, liquidity, etc.)
- Gaming pages (galaga, tetris, slots, coinflip, etc.)
- Admin/platform pages (admin-dashboard, billing, api-docs, etc.)
- Blockchain/wallet pages (wallet, nft-marketplace, governance, etc.)
- Any page not prefixed with `chronicles`, `chrono`, or directly referenced in the chronicles App.tsx

---

## Bottom Line

The full chronicles build is in trust-layer. The standalone repo is the right long-term home for it — it just needs the real content from trust-layer copied in, the tech stack dependencies reconciled, and a decision made on the backend. Once that's done, chronicles is its own self-contained product and development can continue in the standalone repo without touching trust-layer.
