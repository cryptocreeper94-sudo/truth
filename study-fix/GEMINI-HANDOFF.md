# GEMINI HANDOFF — Lume CHI Study UX Improvements
# Repo: cryptocreeper94-sudo/lume (branch: main)
# Files to edit: study/public/ directory ONLY

---

## CONTEXT — READ THIS FIRST

The Lume CHI Study lives at study.tlid.io and is served by the Node/Express
backend in server/server.js. The study files are in study/public/.

A previous fix already moved all inline JavaScript out of HTML files into app.js.
You are building ON TOP of that fix. The study-fix/ folder in this repo contains
the corrected baseline files. Use those as your starting point, not the old ones.

THE STUDY FLOW IS:
  index.html → orientation.html → task.html (×4, at /task/1 through /task/4) → survey.html → done.html

---

## WHAT YOU ARE FIXING — 4 SPECIFIC CHANGES

---

### CHANGE 1 — index.html: Fix the time estimate

FILE: study/public/index.html

FIND this exact sentence in the first paragraph of the .card div:
  "The session takes about 30 minutes."

REPLACE WITH:
  "The session takes about 15–20 minutes."

That is the only change to index.html.

---

### CHANGE 2 — orientation.html: Add a live practice sandbox

FILE: study/public/orientation.html

The current orientation.html shows one example and immediately offers a button to
start Task 1. This is too abrupt for non-coders. You need to add an interactive
practice area BETWEEN the example and the Start Task 1 button.

CURRENT structure of <main>:
  <h2>Before we begin</h2>
  <p>explanation...</p>
  <p>Here's an example...</p>
  <div class="code-block">show "I am learning Lume"</div>
  <p>When you run this...</p>
  <div class="card">That's all Lume is...</div>
  <div style="margin-top: 2rem;">
    <a href="/task/1" class="btn btn-primary">Start Task 1 →</a>
  </div>

NEW structure — INSERT the following block BETWEEN the <div class="card">
and the <div> containing the Start Task 1 button:

  <div class="card" style="margin-top: 2rem;">
    <h3>Try it yourself</h3>
    <p>No timer, no pressure — just see what happens. Type a Lume instruction and click Run.</p>
    <textarea
      id="practice-editor"
      class="editor"
      style="height: 120px; margin-top: 1rem;"
      placeholder='Try: show "Hello world"'
      spellcheck="false"
    ></textarea>
    <div style="margin-top: 0.75rem;">
      <button class="btn btn-primary" id="practice-run-btn">Run ▶</button>
    </div>
    <div id="practice-output" class="output-panel" style="display: none; margin-top: 1rem;">
      <span style="color: var(--accent-cyan); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;">Output</span>
      <div id="practice-output-text" style="margin-top: 0.5rem;"></div>
    </div>
  </div>

The Start Task 1 button div stays exactly where it is, after this new block.

Do NOT change anything else in orientation.html.

---

### CHANGE 3 — app.js: Wire up the practice sandbox + fix the timer

FILE: study/public/app.js

#### 3A — Add practice sandbox logic in initTaskPage area

The practice area in orientation.html needs a Run button that works.
Add a NEW function called initOrientationPage() that handles this.

The Lume interpreter logic already exists inside initTaskPage() — you must
EXTRACT it into a standalone function called interpretLume() that lives at
the module level (OUTSIDE of any page init function), so it can be shared
between initTaskPage() and initOrientationPage().

Here is the exact interpretLume() function to use at module level:

  function interpretLume(code) {
      const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//') && !l.startsWith('///'));
      const vars = {};
      const output = [];
      for (const line of lines) {
          try {
              const defineMatch = line.match(/^define\s+(\w+)\s*=\s*(.+)$/i);
              if (defineMatch) {
                  const name = defineMatch[1];
                  let val = defineMatch[2].trim();
                  if (val.startsWith('[') && val.endsWith(']')) {
                      val = val.slice(1, -1).split(',').map(v => {
                          v = v.trim();
                          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
                          if (!isNaN(v)) return Number(v);
                          return vars[v] !== undefined ? vars[v] : v;
                      });
                  } else if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                      val = val.slice(1, -1);
                  } else if (!isNaN(val)) {
                      val = Number(val);
                  } else {
                      const exprParts = val.split(/\s*([+\-*/])\s*/);
                      if (exprParts.length >= 3) {
                          let result = vars[exprParts[0]] !== undefined ? vars[exprParts[0]] : Number(exprParts[0]) || 0;
                          for (let i = 1; i < exprParts.length; i += 2) {
                              const op = exprParts[i];
                              const operand = vars[exprParts[i+1]] !== undefined ? vars[exprParts[i+1]] : Number(exprParts[i+1]) || 0;
                              if (op === '+') result += operand;
                              else if (op === '-') result -= operand;
                              else if (op === '*') result *= operand;
                              else if (op === '/') result = operand !== 0 ? result / operand : 0;
                          }
                          val = result;
                      } else if (vars[val] !== undefined) {
                          val = vars[val];
                      }
                  }
                  vars[name] = val;
                  continue;
              }
              const showMatch = line.match(/^show\s+(.+)$/i);
              if (showMatch) {
                  let val = showMatch[1].trim();
                  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                      output.push(val.slice(1, -1));
                  } else if (vars[val] !== undefined) {
                      const v = vars[val];
                      output.push(Array.isArray(v) ? v.join(', ') : String(v));
                  } else {
                      output.push(val);
                  }
                  continue;
              }
              const forMatch = line.match(/^for\s+each\s+(\w+)\s+in\s+(\w+)$/i);
              if (forMatch) {
                  const iterVar = forMatch[1];
                  const listVar = forMatch[2];
                  const list = vars[listVar];
                  if (Array.isArray(list)) {
                      const nextLine = lines[lines.indexOf(line) + 1];
                      if (nextLine) {
                          const bodyShow = nextLine.match(/^show\s+(\w+)$/i);
                          if (bodyShow && bodyShow[1] === iterVar) {
                              list.forEach(item => output.push(String(item)));
                              lines.splice(lines.indexOf(nextLine), 1);
                          }
                      }
                  }
                  continue;
              }
          } catch (e) {
              output.push('[Error: ' + e.message + ']');
          }
      }
      return output.length > 0 ? output.join('\n') : '(No output — try adding a "show" instruction)';
  }

Then REMOVE the local interpretLume function from INSIDE initTaskPage() since
it now lives at module level.

Add this new function (BEFORE the DOMContentLoaded bootstrap at the bottom):

  function initOrientationPage() {
      const runBtn = document.getElementById('practice-run-btn');
      if (!runBtn) return;
      runBtn.addEventListener('click', () => {
          const code = document.getElementById('practice-editor').value.trim();
          const outputPanel = document.getElementById('practice-output');
          const outputText = document.getElementById('practice-output-text');
          outputPanel.style.display = 'block';
          outputText.textContent = code ? interpretLume(code) : '(No code entered — type something above)';
      });
  }

Then ADD initOrientationPage() to the DOMContentLoaded bootstrap block.
The bootstrap block at the bottom of app.js should look like this after your change:

  document.addEventListener('DOMContentLoaded', () => {
      requireParticipant();
      initConsentPage();
      initOrientationPage();
      initTaskPage();
      initSurveyPage();
      initDonePage();
      initAdminPage();
  });

#### 3B — Fix the timer in initTaskPage()

CURRENT timer behavior: timer displays immediately, counts from 4:00, giant font.
For non-coders this is stressful. Fix: hide the timer until 60 seconds remain.

In initTaskPage(), find the timer element and the updateTimer function.

CHANGE the timer div's initial display by adding this line immediately after
  const timerEl = document.getElementById('timer');

ADD:
  timerEl.style.opacity = '0';
  timerEl.style.transition = 'opacity 0.5s ease';

Then inside updateTimer(), find the line:
  if (timeLeft <= 60) timerEl.classList.add('warning');

REPLACE that entire line with:
  if (timeLeft <= 60) {
      timerEl.style.opacity = '1';
      timerEl.classList.add('warning');
  }

Also find and REMOVE this line from task.html (the paragraph below the timer):
  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: -1rem;">Time remaining — don't rush, just do your best</p>

That sentence contradicts the countdown and should not be shown.

#### 3C — Soften Task 4 in initTaskPage()

In the tasks array inside initTaskPage(), find the 4th task object (index 3).

REPLACE the entire 4th task object with:

  {
      title: "Display three things",
      prompt: "Write Lume instructions that display three different things. They can be anything — words, numbers, whatever you like.",
      hint: "You already know how to do this! Try using the show instruction three times, once for each thing. Example: show \"pizza\"",
      check: (code, output) => {
          const lines = output.split('\n').filter(l => l.trim().length > 0);
          return lines.length >= 3;
      }
  }

This task is now achievable by any non-coder who made it through tasks 1-3.
Three separate show statements satisfy it. A list+loop also satisfies it.
The check only requires 3 lines of output — no code inspection needed.

---

### CHANGE 4 — style.css: No changes needed.

---

## FILES YOU WILL TOUCH

1. study/public/index.html     — 1 sentence change only
2. study/public/orientation.html — add practice sandbox block
3. study/public/task.html      — remove one <p> tag
4. study/public/app.js         — extract interpretLume(), add initOrientationPage(),
                                  fix timer opacity, update task 4 definition,
                                  add initOrientationPage() to bootstrap

## FILES YOU WILL NOT TOUCH

- server/server.js
- study/public/style.css
- study/public/survey.html
- study/public/done.html
- study/public/admin.html
- study/public/done.html
- Anything outside study/public/ and app.js

---

## VERIFICATION STEPS (do these after making changes)

1. Open study.tlid.io — confirm both checkboxes work and screener appears
2. Click through to orientation — confirm the "Try it yourself" textarea and Run button appear
3. Type:  show "test"  in the practice box and click Run — confirm output shows "test"
4. Click Start Task 1 — confirm you land on the task page and the timer is NOT visible initially
5. Wait 3:01 (or temporarily set timeLeft = 65 in code to test) — confirm timer fades in amber
6. On Task 4 — confirm the new prompt reads "Display three things"
7. Type three show lines, click Run — confirm task auto-completes

---

## IMPORTANT NOTES FOR GEMINI

- Do NOT rewrite files from scratch. Make surgical edits only.
- Do NOT change server/server.js under any circumstances.
- Do NOT add any new npm packages. No new dependencies needed.
- The interpretLume function must be at MODULE LEVEL in app.js (outside any function),
  not inside initTaskPage() and not inside initOrientationPage(). Both functions call it.
- After making all changes, confirm each file was saved before marking complete.
