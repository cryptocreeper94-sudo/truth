# Whitney Gerkin Outreach — Block 2 of 2: Page Build Instructions for Gemini

This is the second block. The email (Block 1) is already done.
Your task now is to build the `/lume-overview` page inside the lume-ops-recon repo.

---

## STEP 0 — READ THESE FILES BEFORE WRITING ANY CODE

Do not write a single line of code until you have read and understood these files.
Read them now, in this order:

1. `client/src/App.tsx` — this is the router. Understand the import pattern (static vs lazy),
   the `Switch`/`Route` structure from `wouter`, and where public vs session-gated routes live.
2. `client/src/pages/Pricing.tsx` — use this as your primary style reference for a public-facing
   page with cards, badges, and sections.
3. `client/src/pages/About.tsx` — secondary style reference.
4. `client/src/components/ui/card.tsx` — understand the Card component API before using it.
5. `client/src/lib/utils.ts` — confirm the `cn()` utility import path.

Only after reading all five files should you begin writing `LumeOverview.tsx`.

---

## STEP 1 — CONFIRMED REPO FACTS (do not guess, these are verified)

- **Router library:** `wouter` — use `Switch` and `Route` from `"wouter"`, NOT react-router-dom
- **Path alias:** `@/` maps to `client/src/` — use `@/components/ui/card` not relative paths
- **Icon library:** `lucide-react` — already installed, use it for all icons
- **framer-motion:** REMOVED from this project — do NOT import or use it anywhere
- **Card component:** available at `@/components/ui/card` — exports `Card`, `CardHeader`,
  `CardContent`, `CardTitle`, `CardDescription`, `CardFooter`
- **Other UI:** `Badge` from `@/components/ui/badge`, `Button` from `@/components/ui/button`
- **Dark theme Tailwind classes:** `bg-slate-950`, `bg-slate-900`, `bg-slate-800`,
  `border-slate-700`, `text-slate-300`, `text-slate-400`, `text-cyan-400`, `text-cyan-300`
- **No new dependencies** — install nothing, use only what is already in the project

---

## STEP 2 — FILE TO CREATE

**Path:** `client/src/pages/LumeOverview.tsx`

Start with this exact skeleton, then fill in each section:

```tsx
import { useEffect } from "react";
import { Shield, RefreshCw, FileCheck, Layers, ArrowRight,
         ExternalLink, ChevronRight, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LumeOverview() {
  useEffect(() => {
    document.title = "LotOpsPro × Lume — DarkWave Studios";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* SECTION 1: Hero */}
      {/* SECTION 2: What you already saw */}
      {/* SECTION 3: What Lume is */}
      {/* SECTION 4: lume-ops-recon native build */}
      {/* SECTION 5: Axiom */}
      {/* SECTION 6: Lume-V wrapping */}
      {/* SECTION 7: About this work */}
      {/* SECTION 8: Further reading */}
      {/* SECTION 9: Footer */}
    </div>
  );
}
```

---

## STEP 3 — ROUTER REGISTRATION

The router lives in `client/src/App.tsx`. It uses `wouter`.

1. Add a **static import** at the top of `App.tsx` alongside the other static page imports
   (not lazy — this is a lightweight public page):
   ```tsx
   import LumeOverview from "@/pages/LumeOverview";
   ```

2. Find the `<Switch>` block inside `App.tsx`. Locate where other public pages are registered
   (pages that do NOT require a session — Login, Pricing, About, PrivacyPolicy, TermsOfService).
   Add the new route in that same public section:
   ```tsx
   <Route path="/lume-overview" component={LumeOverview} />
   ```
   Note: `wouter` uses `component={...}` not `element={<... />}` — match the pattern you see
   in the existing routes exactly.

3. This route must NOT be inside any auth guard, session check, or PrivateRoute wrapper.
   Whitney must be able to open `lotopspro.com/lume-overview` cold from an email link with
   no login. If you are unsure whether a wrapper is auth-gating, check what it does before
   placing the route inside it.

---

## STEP 4 — BUILD EACH SECTION IN ORDER

---

### SECTION 1 — Hero

```tsx
<section className="w-full px-6 py-24 md:py-32 text-center border-b border-slate-800">
  <p className="text-xs uppercase tracking-widest text-cyan-400 mb-6">
    LotOpsPro × Lume — A fuller picture for Cox Automotive
  </p>
  <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
    This is not AI.
  </h1>
  <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
    It is something more reliable.
  </p>
</section>
```

---

### SECTION 2 — What you already saw

Wrapper: `<section className="max-w-5xl mx-auto px-6 py-20">`
Heading: `<h2 className="text-2xl font-semibold mb-10">A quick update on what you've seen</h2>`

Two `Card` components in a `grid grid-cols-1 md:grid-cols-2 gap-6`, with an `ArrowRight`
icon (`text-cyan-400 w-8 h-8`) centered between them — visible on desktop, hidden on mobile
(`hidden md:flex items-center justify-center`).

**Card A** — `className="bg-slate-900 border-slate-700"`
- `CardHeader`: Badge (`variant="outline"`, label `"Previously presented"`) + `CardTitle` "LotOpsPro (What you saw)"
- `CardContent`: three `<p className="text-slate-400 text-sm mb-2">` lines:
  - "React-based lot operations application"
  - "Vehicle inventory, reconditioning workflows, driver management, shift operations"
  - "Built and presented to Cox Automotive"

**Card B** — `className="bg-slate-900 border-cyan-800"`
- `CardHeader`: Badge (`className="bg-cyan-950 text-cyan-300 border-cyan-800"`, label `"Now governed by Lume-V"`) + `CardTitle` "LotOpsPro Today"
- `CardContent`: three `<p className="text-slate-400 text-sm mb-2">` lines, then a closing line:
  - "That same application is now wrapped in Lume-V"
  - "Every operational decision produces a signed, auditable governance certificate"
  - "Speed enforcement, lot capacity, shift rules, weather freezes — all governed in real time"
  - Closing: `<p className="text-slate-300 font-medium mt-4 text-sm">"The UI looks similar. The system underneath is categorically different."</p>`

---

### SECTION 3 — What Lume is

Wrapper: `<section className="bg-slate-900 px-6 py-20">`
Inner: `<div className="max-w-5xl mx-auto">`
Heading: `<h2 className="text-2xl font-semibold mb-3">What Lume actually is</h2>`
Subheading: `<p className="text-slate-400 mb-12 max-w-2xl">Plain language. No jargon.</p>`

Four tiles in `grid grid-cols-1 md:grid-cols-2 gap-6`.
Each tile is a `Card` with `className="bg-slate-800 border-slate-700"`.
Each `CardHeader` contains: icon, optional badge, then `CardTitle`.
Each `CardContent` contains body text in `text-slate-400 text-sm leading-relaxed`.

**Tile 1**
- Icon: `<Shield className="w-6 h-6 text-cyan-400 mb-2" />`
- Badge: `<Badge className="bg-red-950 text-red-400 border-red-800 text-xs mb-2">NOT AI</Badge>`
- Title: "Deterministic, not probabilistic"
- Body: "Lume does not guess, infer, or learn from data. Same input produces the same output
  every time — mathematically guaranteed. It cannot hallucinate. It cannot surprise you."

**Tile 2**
- Icon: `<RefreshCw className="w-6 h-6 text-cyan-400 mb-2" />`
- Title: "Self-monitoring and self-correcting"
- Body: "Lume watches the system state continuously and enforces defined rules as hard constraints.
  It doesn't log violations after the fact — it intervenes in real time."

**Tile 3**
- Icon: `<FileCheck className="w-6 h-6 text-cyan-400 mb-2" />`
- Title: "Every decision is certified"
- Body: "Each governed operation produces an Operational Certificate — a signed, hash-linked record
  of what happened, what rules were checked, and why the decision was made. Replayable.
  Tamper-evident. Audit-ready."

**Tile 4**
- Icon: `<Layers className="w-6 h-6 text-cyan-400 mb-2" />`
- Title: "Works across any domain"
- Body: "Lume is not built for lot operations specifically. It is an architecture that governs
  operations in any domain — physical, logistical, cognitive, organizational — using the same
  deterministic principles."

---

### SECTION 4 — lume-ops-recon native build

Wrapper: `<section className="max-w-5xl mx-auto px-6 py-20">`
Heading: `<h2 className="text-2xl font-semibold mb-10">The next step — built with Lume at the core</h2>`

Single full-width `Card` with `className="bg-slate-900 border border-cyan-800"`:

`CardContent`:
```tsx
<p className="text-slate-300 text-lg leading-relaxed mb-8">
  lume-ops-recon is not a wrapper. It is a lot operations platform built natively on the Lume
  architecture from the ground up. Where LotOpsPro was a React application that Lume-V was
  applied to, lume-ops-recon starts from Lume. The governance is structural, not added on.
</p>
```

Below the paragraph, three feature rows — each a `div` with `flex items-start gap-3 mb-4`:
- `<ChevronRight className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />` + `<p className="text-slate-300">`
  - "Real-time governance of every move, assignment, safety event, and crew action"
  - "Live Operational Certificate chain — every decision signed, chained, and replayable"
  - "Designed to deploy to lotopspro.com as the primary successor to LotOpsPro"

---

### SECTION 5 — Axiom

Wrapper: `<section className="bg-slate-900 px-6 py-20">`
Inner: `<div className="max-w-5xl mx-auto">`

```tsx
<h2 className="text-2xl font-semibold mb-2">If you want a language interface — Axiom</h2>
<p className="text-red-400 text-sm font-medium mb-10">Still not AI.</p>
```

Two-column grid `grid grid-cols-1 md:grid-cols-2 gap-10 items-start`:

**Left column:**
```tsx
<p className="text-slate-300 leading-relaxed">
  Axiom is a Deterministic Language Architecture (DLA). It accepts natural spoken language and
  produces responses by composing from a verified, explicitly defined knowledge base. It cannot
  produce information that is not in that base. Hallucination is not a risk to manage — it is
  architecturally impossible.
</p>
```

**Right column** — `flex flex-col gap-3`:
Four `Card` components with `className="bg-slate-800 border-slate-700"`, no CardHeader,
just `CardContent` with a `<p className="text-slate-300 text-sm flex items-center gap-2">`:
- `<Lock className="w-4 h-4 text-cyan-400 shrink-0" />` + "Driver assistant — lot rules, current assignments, vehicle locations"
- `<Lock className="w-4 h-4 text-cyan-400 shrink-0" />` + "Service writer assistant — work order status, reconditioning workflows"
- `<Lock className="w-4 h-4 text-cyan-400 shrink-0" />` + "Lot manager assistant — shift summaries, capacity reports, safety logs"
- `<Lock className="w-4 h-4 text-cyan-400 shrink-0" />` + "Knowledge packed per role — each version knows only what it needs to"

---

### SECTION 6 — Lume-V wrapping

```tsx
<section className="max-w-3xl mx-auto px-6 py-20 text-center">
  <h2 className="text-2xl font-semibold mb-8">Your existing systems don't have to change</h2>
  <p className="text-slate-300 text-lg leading-relaxed">
    Lume-V is a governance wrapper. It can be applied to systems already in operation, bringing
    deterministic oversight, real-time constraint enforcement, and an auditable decision record —
    without replacing what is already there. The work of integration is significantly lighter than
    a full rebuild.
  </p>
</section>
```

No bullet points. No cards. The paragraph stands alone.

---

### SECTION 7 — About this work

Wrapper: `<section className="bg-slate-900 px-6 py-20">`
Inner: `<div className="max-w-3xl mx-auto">`

```tsx
<h2 className="text-2xl font-semibold mb-8 text-slate-300">A note on where this comes from</h2>

<p className="text-slate-400 leading-relaxed mb-6">
  This technology was not developed for LotOpsPro specifically, and it was not developed for Cox
  Automotive. It is the foundation for 42 applications built independently by Jason Andrews at
  DarkWave Studios LLC. LotOpsPro is one. The architecture was designed to work across all of
  them — and beyond.
</p>

<p className="text-slate-400 leading-relaxed mb-6">
  All of this was built on personal time, with personal resources, without direction from anyone.
  The first presentation to Cox happened sooner than expected — there was one evening to prepare.
  What you are looking at now is the fuller picture.
</p>

<p className="text-slate-600 text-xs mt-8">
  Patent Pending: U.S. Provisional Application No. 64/032,339 | ORCID: 0009-0007-5214-649X
</p>
```

---

### SECTION 8 — Further reading

Wrapper: `<section className="max-w-5xl mx-auto px-6 py-16">`

```tsx
<h2 className="text-xl font-semibold mb-2 text-slate-300">For those who want to go deeper</h2>
<p className="text-slate-500 text-sm mb-10">
  Optional — the page above covers everything needed for a business conversation.
</p>
```

Two `Card` components in `grid grid-cols-1 md:grid-cols-2 gap-6`:

**Card A:**
```tsx
<Card
  className="bg-slate-900 border-slate-700 hover:border-cyan-700 transition-colors cursor-pointer"
  onClick={() => window.open("https://lume-lang.org", "_blank")}
>
  <CardHeader>
    <Badge variant="outline" className="w-fit mb-2">Published reference</Badge>
    <CardTitle className="text-base">Lume Language Specification</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-cyan-400 text-sm flex items-center gap-2">
      <ExternalLink className="w-4 h-4" /> lume-lang.org
    </p>
  </CardContent>
</Card>
```

**Card B:**
```tsx
<Card
  className="bg-slate-900 border-slate-700 hover:border-cyan-700 transition-colors cursor-pointer"
  onClick={() => window.open("https://doi.org/10.5281/zenodo.19491784", "_blank")}
>
  <CardHeader>
    <Badge variant="outline" className="w-fit mb-2">Technical paper</Badge>
    <CardTitle className="text-base">Deterministic Language Architecture</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-cyan-400 text-sm flex items-center gap-2">
      <ExternalLink className="w-4 h-4" /> DOI: 10.5281/zenodo.19491784
    </p>
  </CardContent>
</Card>
```

---

### SECTION 9 — Footer

```tsx
<footer className="border-t border-slate-800 px-6 py-10 text-center">
  <p className="text-slate-400 text-sm mb-1">
    Questions?{" "}
    <a href="mailto:team@dwsc.io" className="text-cyan-400 hover:underline">
      Jason Andrews — team@dwsc.io
    </a>
  </p>
  <p className="text-slate-600 text-xs">DarkWave Studios LLC</p>
</footer>
```

---

## STEP 5 — SELF-VERIFICATION CHECKLIST

Before marking this task complete, verify every item:

- [ ] `client/src/pages/LumeOverview.tsx` exists and has no TypeScript errors
- [ ] framer-motion is NOT imported anywhere in the file
- [ ] All icons are from `lucide-react`
- [ ] All UI components use `@/` path alias (no relative `../../` imports)
- [ ] Route added to `client/src/App.tsx` as a static import using wouter syntax: `component={LumeOverview}`
- [ ] The route is NOT inside any auth guard or session wrapper
- [ ] Page is accessible at `/lume-overview` without logging in
- [ ] All 9 sections are present — spot-check each section heading exists in the rendered output
- [ ] "NOT AI" and "Still not AI." are styled in red (`text-red-400`) to stand out visually
- [ ] Page title updates to "LotOpsPro × Lume — DarkWave Studios" on mount
- [ ] Page has no horizontal scroll on a 375px wide viewport (mobile)
- [ ] No TypeScript errors in the file
