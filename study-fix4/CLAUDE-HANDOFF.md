# HANDOFF — Fix Lume CHI Study Consent Page (Attempt #4)
# Repo: cryptocreeper94-sudo/lume (branch: main)
# Scope: study/public/ directory ONLY

---

## READ THIS FIRST — WHY THIS KEEPS FAILING

This is the 4th attempt to fix study.tlid.io. The first three did not work because
the actual code changes never made it into this repository — they were drafted
elsewhere and never committed and pushed to `main`. The site today is still running
the broken version. Do not assume any prior fix is already in place. Verify
everything from scratch using the steps in this document.

## ROOT CAUSE

`server/server.js` calls `app.use(helmet())` with no configuration. Helmet's
default Content-Security-Policy header is `script-src 'self'`, which makes the
browser silently block every inline `<script>...</script>` block on every page.
There is no console error a typical user would notice — the scripts just never run.

Every page under `study/public/` currently has its actual logic (checkbox
handlers, the "Begin Study" button, the task timer, the survey builder, etc.)
sitting inside an inline `<script>` block. None of it executes. That is why the
consent page checkboxes/screener/button do nothing and the study cannot progress
past consent.

## THE FIX

Move ALL JavaScript logic out of inline `<script>` blocks and into the single
external file `study/public/app.js`, which is already allowed to load because it
is same-origin (`'self'`). Every HTML page keeps only `<script src="/app.js"></script>`
and zero other script content.

Do NOT try to fix this by editing Helmet's config in `server/server.js` to allow
`'unsafe-inline'`. That is a security downgrade and is not necessary — moving the
JS to app.js is the correct, secure fix. **Do not touch `server/server.js` at all.**

## WHAT TO DO — FULL FILE REPLACEMENT (not line edits)

This handoff folder (`study-fix4/`) contains the complete, final, ready-to-use
version of every file that needs to change. Replace the corresponding files in
`study/public/` in the repo with these exact files, byte for byte:

    study-fix4/app.js          → study/public/app.js
    study-fix4/index.html      → study/public/index.html
    study-fix4/orientation.html → study/public/orientation.html
    study-fix4/task.html       → study/public/task.html
    study-fix4/survey.html     → study/public/survey.html
    study-fix4/done.html       → study/public/done.html
    study-fix4/admin.html      → study/public/admin.html

Do NOT hand-merge or partially apply these — copy the full file contents over.
These files already include everything from prior fix attempts, PLUS these three
additional improvements that were requested but never landed:

1. **Orientation page practice sandbox** — a "Try it yourself" textarea + Run
   button on `/orientation` so participants can experiment with Lume syntax
   before Task 1. Already present in the HTML content; this handoff wires up
   its Run button correctly in `app.js` via `initOrientationPage()`.
2. **Invisible timer** — the 4-minute per-task countdown is background
   infrastructure only. It must never be visible to the participant. The
   `<div class="timer" id="timer">` now has `style="display: none;"` baked
   directly into the HTML (not set via JS), so it stays hidden even if
   JS is slow to load.
3. **Task 4 softened** — "Display three things" (three `show` statements),
   achievable by anyone who completed Tasks 1–3. No code inspection, only
   requires 3 lines of output.

`style.css` is untouched — do not modify it.

## STEP-BY-STEP

1. `git checkout main && git pull` in the `lume` repo to make sure you're
   starting from the current live state.
2. Replace the 7 files listed above with the files from `study-fix4/`.
3. Confirm with `grep -rn "<script>" study/public/*.html` that NO file has an
   inline `<script>` tag with content — every page should only have
   `<script src="/app.js"></script>` and nothing else script-related.
4. `git add study/public/ && git commit -m "Fix CSP-blocked inline scripts breaking consent flow" && git push origin main`
5. **Confirm the push actually happened** — run `git log origin/main -1` and
   `git status` to verify there is nothing left uncommitted or unpushed. This is
   the exact step that failed silently in prior attempts.
6. Wait ~2 minutes for Render to auto-deploy from `main`.
7. Visit https://study.tlid.io and run through verification below.

## VERIFICATION (do all of these — do not skip any)

1. Open study.tlid.io in an incognito/private window (avoids stale cache).
2. Open browser DevTools → Console. There should be NO CSP violation errors
   about "Refused to execute inline script."
3. Check "I confirm I am 18 or older" — no error message should appear.
4. Check "I have read the above and agree to participate" — the Screener
   Question section should appear and smoothly scroll into view.
5. Select "No — I have never written code" — the "Begin Study →" button
   should appear.
6. Click "Begin Study →" — you should be redirected to `/orientation`.
7. On `/orientation`, confirm the "Try it yourself" textarea and Run button
   are visible. Type `show "test"` and click Run — confirm the output panel
   shows `test`.
8. Click "Start Task 1 →" — confirm NO countdown timer is visible anywhere
   on the task page, at any point.
9. Complete or skip through all 4 tasks — confirm Task 4 says "Display three
   things" and that typing three separate `show` lines and clicking Run
   auto-advances to the Continue button.
10. Complete the SUS survey — all 10 questions should render, and submitting
    should redirect to `/done` showing a participant code.
11. Also spot check `/admin` — password form should still work and the
    dashboard should still load results.

If ANY of these steps fail, do not consider this fixed — investigate before
reporting completion. Given this is the 4th attempt, over-verify rather than
under-verify.

## FILES YOU WILL NOT TOUCH

- `server/server.js` (and anything else under `server/`)
- `study/public/style.css`
- Anything outside `study/public/`
