# Gemini Verification Handoff
**Date:** June 22, 2026  
**Purpose:** Verify everything built and deployed this session is correct, complete, and live.

---

## 1. Invariant Repo — `cryptocreeper94-sudo/invariant`

Verify the master handoff (`invariant-master-handoff.md`) was fully applied. Check each item:

- [ ] `mulberry32` seeded RNG in place — telemetry values are deterministic, not `Math.random()`
- [ ] Deep linking via URL hash works — state survives page refresh
- [ ] Cross-core signal bus implemented — cores can communicate; status bar reflects live signal state
- [ ] Carousel rebuilt with Lume as the genesis card (first position)
- [ ] Carousel external URLs correct — no `localhost:3000`, `localhost:3001`, or `localhost:3002` references anywhere. Any previously broken URLs are marked `coming_soon`
- [ ] Manifesto paragraph present and matches spec
- [ ] Portable deploy script present and functional
- [ ] `git log --oneline -5` — confirm commits were pushed to `origin main`

---

## 2. Lume Repo — `cryptocreeper94-sudo/lume` → `study/`

Verify the study site was built correctly and is live at `study.tlid.io`.

### 2a. File Structure
Confirm the following exist:
```
study/
  server.js
  public/
    index.html
    orientation.html
    task.html
    survey.html
    done.html
    admin.html
    style.css
    app.js
  data/            ← directory exists, responses.json absent from git
  package.json
  .env.example
```

Confirm `study/data/` is in the root `.gitignore`. Run:
```bash
grep "study/data" .gitignore
```
Must return a match. If absent, add it immediately.

### 2b. Participant Flow — Manual Walkthrough
Visit `study.tlid.io` and complete the full flow as a test participant:

**Consent page (`/`)**
- [ ] Age confirmation checkbox appears FIRST: *"I confirm I am 18 years of age or older"*
- [ ] If age checkbox is unchecked and user tries to proceed → inline message: *"This study is open to participants aged 18 and over."* No progression.
- [ ] Consent checkbox appears second
- [ ] Screener question appears after both boxes are checked
- [ ] Selecting "Yes — I have coding experience" → blocks entry with polite message, no continue button
- [ ] Selecting "No — I have never written code" → "Begin Study →" button appears
- [ ] On submit: `LM-XXXX` participant ID assigned, stored in `sessionStorage`, POST to `/api/session/start` succeeds

**Orientation page (`/orientation`)**
- [ ] Shows example: `show "I am learning Lume"`
- [ ] "Start Task 1 →" button present

**Task pages (`/task/1` through `/task/4`)**
- [ ] Timer starts at `4:00` automatically on page load
- [ ] Timer turns amber at `1:00`, red at `0:30`
- [ ] Timer reaches `0:00` → auto-submits as `timed-out`
- [ ] "I'm Done" stops timer, records elapsed seconds, outcome = `completed`
- [ ] "I'm Stuck / Skip" records outcome = `gave-up`, elapsed seconds at skip
- [ ] Task 1 wording: *"Tell the computer your **favorite color** and your favorite number..."* — NOT "your name"
- [ ] Task 2: conditional logic task
- [ ] Task 3: iteration over Alex, Sam, Jordan
- [ ] Task 4: reusable instruction called `welcome`
- [ ] Code editor present (textarea or CodeMirror)
- [ ] POST to `/api/task` on each completion — confirm payload includes `participantId`, `task`, `completed`, `elapsedSeconds`, `code`, `outcome`
- [ ] No IP address in any payload or server log

**Survey page (`/survey`)**
- [ ] All 10 SUS questions present with exact wording (do not paraphrase)
- [ ] 1–5 radio scale labeled Strongly Disagree → Strongly Agree
- [ ] All 10 required before submit
- [ ] Optional free-text comments field present, not required
- [ ] POST to `/api/survey` succeeds

**Done page (`/done`)**
- [ ] Participant ID (`LM-XXXX`) displayed
- [ ] No further navigation links

### 2c. Admin Dashboard (`/admin`)
- [ ] Password prompt appears on load
- [ ] Wrong password → error shown, no data visible
- [ ] Correct password (`STUDY_ADMIN_PASSWORD` env var) → dashboard loads
- [ ] Test participant session appears in the table
- [ ] Completion checkmarks/crosses correct per task
- [ ] SUS score calculated correctly:
  - Odd questions (1,3,5,7,9): raw score − 1
  - Even questions (2,4,6,8,10): 5 − raw score
  - Sum × 2.5 = final score (0–100)
- [ ] CSV download button works — opens correctly in a spreadsheet
- [ ] CSV contains columns: `participantId, date, task1_completed, task1_seconds, task1_outcome, task1_code, task2_completed, task2_seconds, task2_outcome, task2_code, task3_completed, task3_seconds, task3_outcome, task3_code, task4_completed, task4_seconds, task4_outcome, task4_code, sus_1, sus_2, sus_3, sus_4, sus_5, sus_6, sus_7, sus_8, sus_9, sus_10, sus_score, comments`

### 2d. Anonymity Verification
- [ ] Confirm NO name field exists anywhere in the UI or any API payload
- [ ] Confirm `req.ip` is NOT written to `responses.json` — grep the server code:
  ```bash
  grep -r "req.ip" study/
  ```
  Should return nothing, or if it appears, confirm it is explicitly discarded and never written to disk
- [ ] Confirm no Morgan or other request logger stores IPs
- [ ] `responses.json` (if it exists from testing) does NOT contain IP addresses — inspect the file

### 2e. Branding
- [ ] Background: `#050505`
- [ ] Accent: `#06b6d4` (cyan)
- [ ] Headings: Outfit 900
- [ ] Body: Inter
- [ ] Code/editor: Space Mono
- [ ] Feels like it belongs to the Lume ecosystem — dark, minimal, not a generic form

### 2f. vhost Routing
- [ ] Requests arriving with `Host: study.tlid.io` are intercepted and routed to the study app
- [ ] Requests with any other host header continue to serve the main Lume site normally
- [ ] SSL is valid — `https://study.tlid.io` loads without certificate warnings

---

## 3. Pending Patch — Age Gate

If the age gate checkbox is NOT yet implemented (check the consent page first), apply this patch to `study/public/index.html`:

Add as the first checkbox on the consent form, before the existing consent checkbox:

```html
<label class="checkbox-label">
  <input type="checkbox" id="age-confirm" required>
  I confirm I am 18 years of age or older
</label>
<p id="age-error" style="display:none; color:#f87171;">
  This study is open to participants aged 18 and over.
</p>
```

The "Begin Study" button must validate both `age-confirm` AND the consent checkbox before allowing progression. If `age-confirm` is unchecked, show `#age-error` and halt.

Also add `ageConfirmed: true` to the `/api/session/start` POST payload.

Push after applying:
```bash
git add -A
git commit -m "fix: add 18+ age confirmation to consent form"
git push origin main
```

---

## 4. Final Confirmation

After all checks pass, reply with:
- Invariant: all items verified ✓ / items failing (list them)
- Study site live at `study.tlid.io`: all items verified ✓ / items failing (list them)
- Age gate: already present / patch applied / could not apply (reason)
- Any `responses.json` test data from verification: deleted from server (participant data from test runs should not persist)
