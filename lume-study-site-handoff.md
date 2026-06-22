# Lume CHI Study — Study Facilitation Site Handoff
**For:** Gemini Implementation Agent  
**Date:** June 22, 2026  
**Purpose:** Build a self-contained web application that walks study participants through the CHI user study without a researcher present. Results are stored and exportable as CSV.

---

## What This Site Does

The researcher sends participants a URL. The participant:
1. Reads and agrees to the consent form
2. Answers one screener question
3. Reads a one-line orientation example
4. Completes 4 timed programming tasks in an embedded code editor
5. Fills out the 10-question SUS survey
6. Sees a thank-you screen with their participant ID

The researcher logs into a password-protected `/admin` page to view all submissions and download a CSV.

That's the complete product. No accounts, no auth for participants, no complex infrastructure.

---

## Repo and Location

**Repo:** `cryptocreeper94-sudo/lume`  
**Add as:** `study/` directory at the repo root

```
lume/
  study/
    server.js          ← Express server
    public/
      index.html       ← consent + screener
      orientation.html
      task.html        ← single template, task number passed via query param
      survey.html
      done.html
      admin.html
      style.css
      app.js           ← shared client-side JS
    data/
      responses.json   ← auto-created on first submission, gitignored
    package.json       ← study-specific deps (express only)
    .env.example
    README.md          ← one paragraph: how to run, how to access admin
```

Add `study/data/` to the repo's `.gitignore` — participant data must never be committed.

**URL:** Once deployed, accessible at `lume-lang.org/study` (if the main site reverse-proxies it) or as a standalone Render service at `lume-study.onrender.com`. Either works — confirm with Jason before wiring the reverse proxy.

## Tech Stack

Simple Node.js + Express backend. Single HTML file per page. No framework needed — vanilla JS, clean CSS. Data stored in a flat JSON file on the server (`study/data/responses.json`). This is a research tool for ~16 participants, not a production app.

The Lume repo already uses Node ≥18 and has `marked` as a dependency. Add Express as the only new dependency, scoped to the `study/` subdirectory's own `package.json` so it doesn't pollute the main package.

The admin password is set via environment variable `STUDY_ADMIN_PASSWORD`.

---

## Page Flow

```
/              → Consent + Screener
/orientation   → Lume orientation example
/task/1        → Task 1 (timed)
/task/2        → Task 2 (timed)
/task/3        → Task 3 (timed)
/task/4        → Task 4 (timed)
/survey        → SUS 10-question form
/done          → Thank you + participant ID
/admin         → Password-protected results view + CSV download
```

Session state is tracked in `sessionStorage` (participant ID assigned on load, carried through all pages). No login required for participants.

---

## Visual Design

Match the Lume brand from `lume-lang.org`:
- Background: `#050505`
- Font: `Outfit` (headings) + `Inter` (body) — same Google Fonts as the main site
- Accent: `#06b6d4` (cyan)
- Monospace: `Space Mono` for code
- Cards/panels: `rgba(255,255,255,0.04)` background, `1px solid rgba(255,255,255,0.08)` border
- All caps section labels, generous whitespace, minimal UI

The site should feel like it belongs to the Lume ecosystem — not like a generic Google Form.

---

## Page Specifications

### GET `/` — Consent + Screener

**Top:** Lume wordmark (`LUME` in Outfit 900 + small `RESEARCH` badge in cyan)

**Consent text** (display in a card, full width, readable):
> This is a research study for an academic paper about a new way to write computer instructions using plain English. The session takes about 30 minutes. I'm not testing you — I'm testing the system. There are no wrong answers.
>
> Your responses will be recorded and stored securely. Nothing will be shared publicly with your name attached. Results appear only as group averages in the research paper.
>
> You can stop at any time by closing the browser.

**Checkbox:** `[ ] I have read the above and agree to participate`

**Screener question** (shown after checkbox is checked):
> Have you ever written computer code of any kind — including HTML, Python, JavaScript, Excel formulas, or anything similar?
> `( ) No — I have never written code`
> `( ) Yes — I have some coding experience`

If they select "Yes" → show message: *"Thank you — this study is specifically for people with no prior coding experience. We appreciate your time!"* No continue button.

If they select "No" → show "Begin Study →" button.

On submit: assign a random `participantId` (format: `LM-XXXX` where X is random alphanumeric). Store in `sessionStorage`. POST to `/api/session/start` with `{ participantId, timestamp, screener: 'no-experience' }`. Redirect to `/orientation`.

---

### GET `/orientation` — Lume Orientation

**Heading:** "Before we begin"

**Body text:**
> You're going to write some simple instructions for a computer. Don't worry about syntax or rules — just write what feels natural.
>
> Here's an example of a Lume instruction:

**Code display** (monospace card, dark background, cyan text):
```
show "I am learning Lume"
```

**Below the code:**
> When you run this, the computer displays: **I am learning Lume**
>
> That's all Lume is — plain instructions in plain English. You'll write four of them. Each one has a 4-minute time limit. Do your best, and don't worry if something doesn't work — that's useful information too.

**Button:** "Start Task 1 →"

---

### GET `/task/:n` — Task Pages (1–4)

**Layout:** Two columns on desktop, stacked on mobile.

**Left column:**
- Task number indicator: `TASK 1 OF 4`
- Time remaining: large countdown timer, starts at `4:00`, counts down. Turns amber at 1:00, red at 0:30.
- Task description (large, readable):
  - Task 1: *"Tell the computer your name and your favorite number. Then have it display a message that includes both."*
  - Task 2: *"Write instructions that check if a number is bigger than 50. If it is, have the computer say 'large.' If it isn't, have it say 'small.'"*
  - Task 3: *"You have three friends: Alex, Sam, and Jordan. Write something that says hello to each of them."*
  - Task 4: *"Create a reusable instruction called 'welcome' that takes a person's name and produces a greeting. Use it to welcome someone named 'Chris.'"*
- Two buttons at the bottom:
  - `✓ I'm Done` (primary, cyan)
  - `I'm Stuck / Skip` (secondary, muted)

**Right column:**
- Code editor (use CodeMirror or a simple `<textarea>` styled as a terminal — dark background, monospace, cyan cursor)
- `▶ Run` button below the editor
- Output panel below Run: shows output or error in a dark card

**Timer behavior:**
- Timer starts automatically when the page loads
- If timer reaches 0:00 → auto-submit as "timed out"
- `I'm Done` button → records completion = true, stops timer, records elapsed time
- `I'm Stuck / Skip` → records completion = false, reason = 'gave-up', records elapsed time at skip

**On task completion**, POST to `/api/task` with:
```json
{
  "participantId": "LM-XXXX",
  "task": 1,
  "completed": true,
  "elapsedSeconds": 87,
  "code": "...whatever they typed...",
  "outcome": "completed" // or "gave-up" or "timed-out"
}
```

Then redirect to `/task/2`, `/task/3`, `/task/4`, or `/survey` after task 4.

**Important:** The code editor does NOT need to actually run Lume. Record what they typed and whether they self-reported completion. If you can wire it to a Lume runtime endpoint, great — but it is not required for the study. What matters is what they wrote and how long it took.

If you DO wire up execution: POST their code to `https://lume-lang.org/api/run` or whatever the Lume Playground API endpoint is, display the output. If that endpoint doesn't exist or is unavailable, show a static mock output and note "execution not available in study environment."

---

### GET `/survey` — SUS Form

**Heading:** "Almost done — a few quick questions"

**Subheading:** *"For each statement, select how much you agree or disagree about the Lume system you just used."*

Display all 10 SUS questions as a vertical list. Each question has a 1–5 radio button scale labeled:
`1 = Strongly Disagree` ... `5 = Strongly Agree`

Questions (exact wording — do not change):
1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

**Optional open text field at the bottom:**
> *"Is there anything else you'd like to say about the experience?"* (textarea, not required)

**Button:** "Submit →"

On submit, POST to `/api/survey` with:
```json
{
  "participantId": "LM-XXXX",
  "sus": [3, 2, 4, 2, 3, 2, 4, 1, 4, 2],
  "comments": "..."
}
```

Redirect to `/done`.

---

### GET `/done` — Thank You

**Heading:** "Thank you."

**Body:**
> Your responses have been recorded. Your participant ID is:

**Large display:** `LM-XXXX` (their assigned ID, from sessionStorage)

> Please share this ID with the researcher if asked.
>
> You've contributed to research on making programming accessible to everyone. That matters.

No further buttons or links.

---

### GET `/admin` — Results Dashboard

**Password protected.** On load, show a password prompt (plain HTML `<form>` with a password `<input>`). POST to `/api/admin/auth` with the password. On success, set a session cookie and show the dashboard. On failure, show error.

**Dashboard displays:**

**Summary stats:**
- Total participants: N
- Overall task completion rate: X% 
- Per-task completion rates: Task 1: X%, Task 2: X%, Task 3: X%, Task 4: X%
- Mean SUS score: X.X
- Mean time per completed task: X.X seconds

**Participant table** — one row per participant:

| ID | Date | T1 | T2 | T3 | T4 | SUS | Comments |
|---|---|---|---|---|---|---|---|
| LM-A1B2 | 2026-07-01 | ✓ 45s | ✓ 78s | ✓ 112s | ✗ gave up | 82.5 | "easier than I expected" |

Completion shown as ✓ (completed) or ✗ (gave up / timed out) with elapsed time.

**Download CSV button** — exports all raw data as a CSV file. Format:

```
participantId,date,task1_completed,task1_seconds,task1_outcome,task1_code,task2_completed,task2_seconds,task2_outcome,task2_code,task3_completed,task3_seconds,task3_outcome,task3_code,task4_completed,task4_seconds,task4_outcome,task4_code,sus_1,sus_2,sus_3,sus_4,sus_5,sus_6,sus_7,sus_8,sus_9,sus_10,sus_score,comments
```

---

## Backend API Routes

```
POST /api/session/start   — create participant session
POST /api/task            — record task result
POST /api/survey          — record SUS responses
POST /api/admin/auth      — validate admin password
GET  /api/admin/results   — return all results JSON (protected)
GET  /api/admin/csv       — return results as CSV download (protected)
```

All data written to `/data/responses.json` as an append array. No database needed.

---

## Environment Variables

```
STUDY_ADMIN_PASSWORD=your-chosen-password
PORT=3000
```

---

## Verification Checklist

Before deploying:

- [ ] Participant flow works end to end: `/` → `/orientation` → `/task/1` → `/task/2` → `/task/3` → `/task/4` → `/survey` → `/done`
- [ ] Timer counts down and auto-submits at 0:00
- [ ] "I'm Done" stops timer and records elapsed time correctly
- [ ] "I'm Stuck / Skip" records gave-up correctly
- [ ] SUS all 10 questions present, exact wording, all required before submit
- [ ] Participant ID persists across all pages (sessionStorage)
- [ ] Admin page requires password
- [ ] Admin dashboard shows correct completion rates and mean SUS
- [ ] CSV download contains all fields, opens correctly in Excel/Google Sheets
- [ ] Screener correctly blocks participants who select "Yes — I have coding experience"
- [ ] Mobile-friendly (participants may use phones)
- [ ] Works without internet after initial page load (no external dependencies that could fail mid-session)

---

## Push

```bash
git add -A
git commit -m "feat: lume chi study facilitation site"
git push origin main
```
