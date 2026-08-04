---
name: Axiom design system
description: Non-negotiable visual rules for anything user-facing in Axiom
---

Confirmed by the user as the site-wide standard (Aug 2026):

- **Sections strictly alternate** dark `#0c0c14` and warm crème `#f5f2eb` (never cold gray/white).
- **Noise overlay:** every section gets a `::before` SVG fractalNoise layer at exactly 4% opacity.
- **Type:** Inter 900 tight-tracking for headings; JetBrains Mono for all labels/tags/captions; the word "AXIOM" always JetBrains Mono 700 uppercase.
- **Accents:** cyan `#22d3ee`, teal `#2dd4bf`, purple `#c084fc`, rose `#fb7185`.
- **Images:** `grayscale(100%)` by default, full color on hover (0.4s transition).
- **Cards:** 3D tilt on mouse move (perspective 800px, ±8°), custom hook — do not install tilt libraries.
- No emojis in UI. Patent notice in footer in purple mono.
- Full token reference: `demo/axiom.css` in the DDA repo.

**How to apply:** any new page, panel, or artifact for Axiom must follow these before shipping; the first home-page attempt ignored them and had to be rebuilt.
