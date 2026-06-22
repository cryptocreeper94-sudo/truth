# Lume CHI Pilot Study — Complete Protocol
**Paper:** Eliminating Cognitive Distance: A Deterministic Natural-Language Programming Language  
**Target:** CHI 2027 (September 2026 submission deadline)  
**Study type:** Within-subjects comparative pilot study  
**Time per session:** ~45 minutes  
**Target n:** 12–16 participants  
**No IRB required** (independent researcher, no institutional affiliation — disclose this in the paper)

---

## What You're Measuring

The paper claims Lume reduces cognitive distance across six dimensions. The study directly measures three of them in a way CHI reviewers will accept:

- **D1 (Syntactic distance):** Time to produce working code
- **D4 (Error recovery):** Number of errors / corrections made
- **D3 (Modality / usability):** System Usability Scale (SUS) — a validated 10-question survey used in thousands of published studies

You do NOT need to measure all six. Three dimensions with real data is stronger than six dimensions self-rated.

---

## Who to Recruit

Target: **people who have written any code at any point in their life.** Does not need to be their job. Could be a high school Python class, a JavaScript tutorial, anything. Pure non-programmers won't give you useful data because they'll struggle with both systems equally.

Good sources:
- Friends/family who work in tech (even tangentially)
- Coworkers or former coworkers
- LinkedIn connections in software, data, engineering
- Discord servers (programming communities)
- Reddit: r/learnprogramming, r/webdev (post a "research study, 45 min, [optional: $10 gift card]" call)

**Aim for diversity in experience level** — some beginners, some intermediate, a few experienced. Note each person's self-reported experience (1–5 scale) in your data sheet. This becomes a variable in your analysis.

---

## The Four Tasks

These are written to be simple enough that any programmer can attempt them, but substantive enough to show a real difference between Lume and Python.

**Task 1 — Variables and Output (Warmup)**
> Create a variable called `score` set to 42. Create a variable called `player` set to your name. Print a message that says: "Player [name] has score [score]."

**Task 2 — Conditional Logic**
> Write code that checks if a number called `temperature` is above 100. If it is, print "Too hot." If it is not, print "Safe."

**Task 3 — Loop**
> Write code that goes through a list of names: ["Alice", "Bob", "Carol"]. For each name, print "Hello, [name]!"

**Task 4 — Function**
> Write a function called `greet` that takes a name and returns a greeting string. Call it with the name "Jason" and print the result.

These four tasks map directly to the paper's core syntax coverage. They're short enough to complete in 5–8 minutes each, leaving time for questions and the survey.

---

## Session Structure (45 minutes)

| Time | Activity |
|---|---|
| 0–5 min | Welcome, consent form, background questions |
| 5–10 min | Brief Lume orientation (show them 2 examples, not the actual tasks) |
| 10–25 min | **Lume tasks** — Tasks 1–4, timed individually |
| 25–30 min | Brief Python reminder (same 2 example types) |
| 30–45 min | **Python tasks** — same Tasks 1–4, timed individually |
| 45 min | SUS survey (10 questions, 5 min) |

**Important:** Half your participants do Lume first, half do Python first. Alternate: participant 1 = Lume first, participant 2 = Python first, etc. This controls for learning effects. Note which order each person did in your data sheet.

For remote sessions: Zoom with screen share. Ask them to share their screen before they start each task so you can see their work. You time on your end — don't ask them to time themselves.

For in-person sessions: sit beside them, start a stopwatch on your phone when you say "go," stop it when they say "done" or show you working output.

---

## What to Record Per Task

Use the data sheet below. For each task, record:

- **Start time / Stop time** (or just elapsed seconds)
- **Completed?** (Y / N — did they produce working output)
- **Error count** — every time they visibly pause, delete and retype, or say "wait that's wrong" counts as 1
- **Gave up?** (Y / N — if they couldn't finish in 4 minutes, note it and move on)

---

## Data Sheet (copy one per participant)

```
PARTICIPANT ID: ____    DATE: ____    ORDER: Lume-first / Python-first (circle)
EXPERIENCE LEVEL: 1-Beginner  2-Some experience  3-Intermediate  4-Advanced  5-Expert

LUME TASKS
Task 1: Time ___s  Completed Y/N  Errors ___  Gave up Y/N
Task 2: Time ___s  Completed Y/N  Errors ___  Gave up Y/N
Task 3: Time ___s  Completed Y/N  Errors ___  Gave up Y/N
Task 4: Time ___s  Completed Y/N  Errors ___  Gave up Y/N

PYTHON TASKS
Task 1: Time ___s  Completed Y/N  Errors ___  Gave up Y/N
Task 2: Time ___s  Completed Y/N  Errors ___  Gave up Y/N
Task 3: Time ___s  Completed Y/N  Errors ___  Gave up Y/N
Task 4: Time ___s  Completed Y/N  Errors ___  Gave up Y/N

NOTES (anything they said out loud, visible frustration moments, etc.):
___________________________________________
```

---

## SUS Survey (System Usability Scale)

Give this ONCE at the end, asking them to rate **Lume specifically** (you can run a separate SUS for Python if you want but it's not required).

The SUS is a validated, standardized instrument used in thousands of published papers. Use it exactly as written — do not change the wording.

**"For each statement, circle a number from 1 (Strongly Disagree) to 5 (Strongly Agree):"**

1. I think that I would like to use this system frequently. `1 2 3 4 5`
2. I found the system unnecessarily complex. `1 2 3 4 5`
3. I thought the system was easy to use. `1 2 3 4 5`
4. I think that I would need the support of a technical person to be able to use this system. `1 2 3 4 5`
5. I found the various functions in this system were well integrated. `1 2 3 4 5`
6. I thought there was too much inconsistency in this system. `1 2 3 4 5`
7. I would imagine that most people would learn to use this system very quickly. `1 2 3 4 5`
8. I found the system very cumbersome to use. `1 2 3 4 5`
9. I felt very confident using the system. `1 2 3 4 5`
10. I needed to learn a lot of things before I could get going with this system. `1 2 3 4 5`

**SUS Score Calculation:**
- Odd questions (1,3,5,7,9): subtract 1 from their answer
- Even questions (2,4,6,8,10): subtract their answer from 5
- Sum all 10 results, multiply by 2.5
- Score range: 0–100. Above 68 = above average usability. Above 80 = excellent.

---

## Consent Form

Print or paste this into a Google Form. Participant must agree before the session starts.

---

**INFORMED CONSENT FORM**
**Study: Evaluating a Natural-Language Programming System**

**Purpose:** You are being invited to participate in a research study evaluating a new programming language. The goal is to understand how different programming interfaces affect ease of use and task completion.

**What you will do:** You will be asked to complete 4 short programming tasks using two different systems, and answer a brief questionnaire. The session will take approximately 45 minutes.

**Recording:** If conducted remotely, the session may be screen-recorded for analysis purposes only. No recordings will be shared publicly. If you prefer not to be recorded, you may opt out and the researcher will take notes manually.

**Risks:** There are no known risks beyond those of normal computer use. You may find some tasks challenging — this is expected and reflects on the system, not on your abilities.

**Voluntary participation:** Your participation is completely voluntary. You may stop at any time without consequence.

**Data handling:** Your responses will be stored securely and reported in aggregate. No personally identifying information will be published. You will be assigned a participant ID number.

**Contact:** [your email address]

**By participating, you confirm that you have read this form and agree to participate voluntarily.**

Name (or initials): ________________  Date: ________________

---

## Analysis (What to Do With the Numbers)

Once you have 12–16 complete sessions, open a spreadsheet and compute:

**1. Mean task completion time — Lume vs Python**
Average all four tasks across all participants for each system. You want two numbers: mean Lume time, mean Python time.

**2. Mean error count — Lume vs Python**
Same: average errors per participant per system.

**3. Completion rate**
What % of tasks were completed successfully in each system.

**4. SUS score**
Calculate SUS for each participant, then average across all participants.

**5. Simple statistical test**
Use a paired t-test (since it's within-subjects — same person did both). You can run this in Excel (`=T.TEST`) or Google Sheets. You need: your Lume times column, your Python times column, tails=2, type=1. This gives you a p-value. If p < 0.05, the difference is statistically significant. If not, report the trend and note the small sample size.

That's the entire analysis. You don't need SPSS or R. A spreadsheet is fine for n=12–16.

---

## What to Write in the Paper

This is the exact structure for Section 7 (or wherever the evaluation goes):

---

**7. Preliminary Evaluation**

**7.1 Study Design**
We conducted a within-subjects pilot study (n=14) with participants drawn from a convenience sample of developers with varying experience levels (1–5 self-reported scale: M=2.8, SD=1.1). Each participant completed four programming tasks in both Lume and Python, with task order counterbalanced to control for learning effects. Tasks covered four fundamental constructs: variable assignment and output, conditional logic, iteration, and function definition. Task completion time (seconds), error count, and task completion rate were recorded by the researcher. Participants completed the System Usability Scale (SUS) [Brooke 1996] for Lume at the end of the session. As an independent study without institutional affiliation, informed consent was obtained from all participants under a self-administered consent protocol.

**7.2 Results**
Mean task completion time was X.X seconds for Lume vs. X.X seconds for Python (paired t-test: t(13)=X.XX, p=X.XX). Error rate was X.X per task in Lume vs. X.X per task in Python. Task completion rate was XX% for Lume vs. XX% for Python. The mean SUS score for Lume was XX.X (SD=X.X), [above/below] the established usability benchmark of 68 [Bangor et al. 2008]. These results provide preliminary empirical support for the D1 (syntactic distance) and D4 (error recovery) claims of the cognitive distance framework. A controlled study with a larger sample is planned as future work.

**7.3 Limitations**
This pilot study used a convenience sample and small n, limiting generalizability. Participants were not screened for prior Lume exposure. Task complexity was intentionally constrained to foundational constructs; results may not extend to larger programs. Statistical results should be interpreted as directional rather than definitive.

---

*(Fill in the X values from your actual data.)*

---

## References to Add to the Paper

- Brooke, J. (1996). SUS: A 'quick and dirty' usability scale. *Usability Evaluation in Industry*, 189(194), 4–7.
- Bangor, A., Kortum, P., & Miller, J. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human-Computer Interaction*, 24(6), 574–594.

These are the two canonical SUS citations. Both are freely available online.

---

## Timeline to September

| Week | Task |
|---|---|
| Week 1 | Set up session structure, practice running it once on yourself |
| Week 2–4 | Run sessions (3–4 per week, 45 min each) |
| Week 5 | Enter all data into spreadsheet, run t-test, calculate SUS |
| Week 6 | Write Section 7 using the template above |
| Week 7 | Revise abstract and contributions section to reference the study |
| Week 8 | Final proofread, format check, submit |

You can realistically do 3 sessions per week. 14 participants = ~5 weeks of sessions. That fits the timeline with 3 weeks left for writing.
