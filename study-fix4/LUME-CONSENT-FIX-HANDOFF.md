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

This handoff also bundles three additional improvements that were requested
before but never landed, since they touch the same files:

1. **Orientation page practice sandbox** — a "Try it yourself" textarea + Run
   button on `/orientation` so participants can experiment with Lume syntax
   before Task 1.
2. **Invisible timer** — the 4-minute per-task countdown is background
   infrastructure only and must never be visible to the participant. The timer
   div now has `style="display: none;"` baked directly into the HTML.
3. **Task 4 softened** — "Display three things" (three `show` statements),
   achievable by anyone who completed Tasks 1–3. No code inspection, only
   requires 3 lines of output.

`style.css` is untouched — do not modify it.

## WHAT TO DO — FULL FILE REPLACEMENT (not line edits)

Below are the complete, final, ready-to-use contents of every file that needs
to change, each one clearly separated. Replace the corresponding file in
`study/public/` in the repo with the exact content shown — copy the whole
block between the `>>>>>> START` and `<<<<<< END` markers for each file,
byte for byte. Do NOT hand-merge or partially apply these.

    study/public/app.js
    study/public/index.html
    study/public/orientation.html
    study/public/task.html
    study/public/survey.html
    study/public/done.html
    study/public/admin.html

---

>>>>>>> START FILE: study/public/app.js
```javascript
// ============================================================
// Lume CHI Study — Shared App Logic
// ALL page JavaScript lives here. No page may have an inline
// <script> block with actual logic in it — Helmet's default CSP
// (script-src 'self') silently blocks inline scripts, and that
// is the root cause of every "consent page won't advance" bug
// seen in this study so far.
// ============================================================

// ── API Helper ──
async function apiPost(endpoint, data) {
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return { error: 'Network error' };
    }
}

// ── Session Management ──
function getParticipantId() {
    return sessionStorage.getItem('participantId');
}

function setParticipantId(id) {
    sessionStorage.setItem('participantId', id);
}

function generateParticipantId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'LM-';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// ── Guard: redirect to / if no participant ID (skip index and admin) ──
function requireParticipant() {
    if (!getParticipantId() && window.location.pathname !== '/' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/';
    }
}

// ============================================================
// ── Shared: Lume Interpreter (module level so both the
//    orientation practice sandbox and the task runner can use it) ──
// ============================================================
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
                        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                            return v.slice(1, -1);
                        }
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
                            const operand = vars[exprParts[i + 1]] !== undefined ? vars[exprParts[i + 1]] : Number(exprParts[i + 1]) || 0;
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
            output.push(`[Error: ${e.message}]`);
        }
    }

    return output.length > 0 ? output.join('\n') : '(No output — try adding a "show" instruction)';
}

// ============================================================
// ── PAGE: index.html — Consent + Screener ──
// ============================================================
function initConsentPage() {
    const consentCheck = document.getElementById('consent-check');
    const ageCheck = document.getElementById('age-check');
    if (!consentCheck || !ageCheck) return;

    const ageError = document.getElementById('age-error');
    const screenerSection = document.getElementById('screener-section');

    consentCheck.addEventListener('change', (e) => {
        if (e.target.checked && !ageCheck.checked) {
            e.target.checked = false;
            ageError.style.display = 'block';
            screenerSection.style.display = 'none';
        } else {
            ageError.style.display = 'none';
            screenerSection.style.display = e.target.checked ? 'block' : 'none';

            if (e.target.checked) {
                setTimeout(() => {
                    screenerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    });

    ageCheck.addEventListener('change', (e) => {
        if (e.target.checked) ageError.style.display = 'none';
        if (!e.target.checked) {
            consentCheck.checked = false;
            screenerSection.style.display = 'none';
        }
    });

    const radios = document.querySelectorAll('input[name="screener"]');
    radios.forEach(r => r.addEventListener('change', (e) => {
        if (e.target.value === 'yes') {
            document.getElementById('screener-yes-msg').style.display = 'block';
            document.getElementById('screener-no-msg').style.display = 'none';
        } else {
            document.getElementById('screener-yes-msg').style.display = 'none';
            document.getElementById('screener-no-msg').style.display = 'block';

            setTimeout(() => {
                document.getElementById('screener-no-msg').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }));

    const beginBtn = document.getElementById('begin-btn');
    if (beginBtn) {
        beginBtn.addEventListener('click', async () => {
            const pid = generateParticipantId();
            setParticipantId(pid);

            beginBtn.disabled = true;
            beginBtn.textContent = 'Starting...';

            await apiPost('/api/session/start', {
                participantId: pid,
                timestamp: new Date().toISOString(),
                screener: 'no-experience',
                ageConfirmed: true
            });

            window.location.href = '/orientation';
        });
    }
}

// ============================================================
// ── PAGE: orientation.html — Practice Sandbox ──
// ============================================================
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

// ============================================================
// ── PAGE: task.html — Lume Task Runner ──
// ============================================================
function initTaskPage() {
    if (!document.getElementById('task-label')) return;

    const tasks = [
        {
            title: "Display a greeting",
            prompt: "Write a Lume instruction that displays the message: Hello, I am learning Lume",
            hint: 'Remember from the orientation: <code>show "your message here"</code> displays text on the screen.',
            check: (code, output) => output.toLowerCase().includes('hello') && output.toLowerCase().includes('lume')
        },
        {
            title: "Work with a variable",
            prompt: "Create a variable called 'age' and set it to any number. Then display it.",
            hint: "In Lume, you can create a variable with <code>define age = 25</code> and display it with <code>show age</code>",
            check: (code, output) => code.toLowerCase().includes('define') && code.toLowerCase().includes('age')
        },
        {
            title: "Make a simple calculation",
            prompt: "Create two number variables, add them together, and display the result.",
            hint: "You can write: <code>define x = 10</code>, <code>define y = 20</code>, <code>define total = x + y</code>, <code>show total</code>",
            check: (code, output) => code.toLowerCase().includes('define') && (code.includes('+') || code.toLowerCase().includes('add'))
        },
        {
            title: "Display three things",
            prompt: "Write Lume instructions that display three different things. They can be anything — words, numbers, whatever you like.",
            hint: 'You already know how to do this! Try using the show instruction three times, once for each thing. Example: <code>show "pizza"</code>',
            check: (code, output) => {
                const lines = output.split('\n').filter(l => l.trim().length > 0);
                return lines.length >= 3;
            }
        }
    ];

    const taskNum = parseInt(window.location.pathname.split('/').pop()) || 1;
    const taskIndex = taskNum - 1;
    const task = tasks[taskIndex] || tasks[0];

    document.getElementById('task-label').textContent = `TASK ${taskNum} OF 4`;
    document.getElementById('task-title').textContent = task.title;
    document.getElementById('task-prompt').textContent = task.prompt;
    document.getElementById('task-hint').innerHTML = task.hint;

    // ── Timer (background only — never shown to the participant) ──
    let timeLeft = 240; // 4 minutes
    let timerInterval;
    const timerEl = document.getElementById('timer');
    timerEl.style.display = 'none';

    function updateTimer() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTask(false);
        }
        timeLeft--;
    }

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    const editor = document.getElementById('code-editor');
    const outputPanel = document.getElementById('output-panel');
    const outputText = document.getElementById('output-text');

    async function submitTask(completed) {
        clearInterval(timerInterval);
        const code = editor.value.trim();
        const elapsed = 240 - Math.max(0, timeLeft);
        const output = code ? interpretLume(code) : '';

        await apiPost('/api/task/submit', {
            participantId: getParticipantId(),
            taskNumber: taskNum,
            code: code,
            timeSeconds: elapsed,
            completed: completed,
            output: output
        });

        const nextSection = document.getElementById('next-section');
        const resultMsg = document.getElementById('result-msg');

        if (completed) {
            resultMsg.textContent = 'Nice work! Your response has been recorded.';
        } else if (timeLeft <= 0) {
            resultMsg.textContent = "Time's up! No worries — your attempt has been recorded.";
        } else {
            resultMsg.textContent = "Task skipped — that's completely fine. Moving on.";
        }

        nextSection.style.display = 'block';
        document.getElementById('run-btn').disabled = true;
        document.getElementById('skip-btn').disabled = true;
        editor.readOnly = true;

        nextSection.scrollIntoView({ behavior: 'smooth' });
    }

    document.getElementById('run-btn').addEventListener('click', () => {
        const code = editor.value.trim();
        if (!code) {
            outputPanel.style.display = 'block';
            outputText.textContent = '(No code entered — type your instructions above)';
            return;
        }
        const result = interpretLume(code);
        outputPanel.style.display = 'block';
        outputText.textContent = result;

        setTimeout(() => {
            const code2 = editor.value.trim();
            const out = outputText.textContent;
            if (code2 && task.check(code2, out)) {
                submitTask(true);
            }
        }, 100);
    });

    document.getElementById('skip-btn').addEventListener('click', () => submitTask(false));

    document.getElementById('next-btn').addEventListener('click', () => {
        if (taskNum < 4) {
            window.location.href = `/task/${taskNum + 1}`;
        } else {
            window.location.href = '/survey';
        }
    });
}

// ============================================================
// ── PAGE: survey.html — SUS Survey ──
// ============================================================
function initSurveyPage() {
    const container = document.getElementById('sus-container');
    if (!container) return;

    const questions = [
        "I think that I would like to use this system frequently.",
        "I found the system unnecessarily complex.",
        "I thought the system was easy to use.",
        "I think that I would need the support of a technical person to use this system.",
        "I found the various functions in this system were well integrated.",
        "I thought there was too much inconsistency in this system.",
        "I would imagine that most people would learn to use this system very quickly.",
        "I found the system very cumbersome to use.",
        "I felt very confident using the system.",
        "I needed to learn a lot of things before I could get going with this system."
    ];

    questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = 'sus-question';
        div.innerHTML = `
            <p>${i + 1}. ${q}</p>
            <div class="sus-scale">
                <label><input type="radio" name="q${i}" value="1" required> 1 - Strongly Disagree</label>
                <label><input type="radio" name="q${i}" value="2" required> 2</label>
                <label><input type="radio" name="q${i}" value="3" required> 3 - Neutral</label>
                <label><input type="radio" name="q${i}" value="4" required> 4</label>
                <label><input type="radio" name="q${i}" value="5" required> 5 - Strongly Agree</label>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('survey-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        const sus = [];
        for (let i = 0; i < 10; i++) {
            const val = document.querySelector(`input[name="q${i}"]:checked`).value;
            sus.push(parseInt(val, 10));
        }

        const comments = document.getElementById('comments').value;

        await apiPost('/api/survey', {
            participantId: getParticipantId(),
            sus: sus,
            comments: comments
        });

        window.location.href = '/done';
    });
}

// ============================================================
// ── PAGE: done.html — Completion Screen ──
// ============================================================
function initDonePage() {
    const pidDisplay = document.getElementById('pid-display');
    if (!pidDisplay) return;
    const pid = getParticipantId();
    pidDisplay.textContent = pid || 'N/A';
}

// ============================================================
// ── PAGE: admin.html — Admin Panel ──
// ============================================================
function initAdminPage() {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    function calculateSUSScore(susArray) {
        if (!susArray || susArray.length !== 10) return null;
        let rawSum = 0;
        for (let i = 0; i < 10; i++) {
            rawSum += (i % 2 === 0) ? (susArray[i] - 1) : (5 - susArray[i]);
        }
        return rawSum * 2.5;
    }

    async function loadData() {
        const res = await fetch('/api/admin/results');
        if (!res.ok) return;
        const data = await res.json();

        document.getElementById('stat-total').textContent = data.length;

        let t1c = 0, t2c = 0, t3c = 0, t4c = 0;
        let susSum = 0, susCount = 0;
        let timeSum = 0, timeCount = 0;

        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        data.forEach(r => {
            if (r.task1_completed) t1c++;
            if (r.task2_completed) t2c++;
            if (r.task3_completed) t3c++;
            if (r.task4_completed) t4c++;

            const sus = calculateSUSScore(r.sus);
            if (sus !== null) {
                susSum += sus;
                susCount++;
            }

            [1, 2, 3, 4].forEach(t => {
                if (r[`task${t}_completed`]) {
                    timeSum += (r[`task${t}_seconds`] || 0);
                    timeCount++;
                }
            });

            const tr = document.createElement('tr');
            const dDate = new Date(r.date || Date.now()).toLocaleDateString();

            const getT = (n) => {
                if (r[`task${n}_completed`] === undefined) return '-';
                const icon = r[`task${n}_completed`] ? '✓' : '✗';
                const time = r[`task${n}_seconds`] || 0;
                return `${icon} ${time}s`;
            };

            tr.innerHTML = `
                <td style="font-family: var(--font-mono);">${r.participantId}</td>
                <td>${dDate}</td>
                <td>${getT(1)}</td>
                <td>${getT(2)}</td>
                <td>${getT(3)}</td>
                <td>${getT(4)}</td>
                <td>${sus !== null ? sus : '-'}</td>
                <td><div style="max-width: 200px; max-height: 100px; overflow-y: auto; font-size: 0.8rem;">${(r.comments || '').replace(/</g, '&lt;')}</div></td>
            `;
            tbody.appendChild(tr);
        });

        if (data.length > 0) {
            document.getElementById('stat-t1').textContent = Math.round((t1c / data.length) * 100) + '%';
            document.getElementById('stat-t2').textContent = Math.round((t2c / data.length) * 100) + '%';
            document.getElementById('stat-t3').textContent = Math.round((t3c / data.length) * 100) + '%';
            document.getElementById('stat-t4').textContent = Math.round((t4c / data.length) * 100) + '%';
        }

        if (susCount > 0) {
            document.getElementById('stat-sus').textContent = (susSum / susCount).toFixed(1);
        }
        if (timeCount > 0) {
            document.getElementById('stat-time').textContent = (timeSum / timeCount).toFixed(1) + 's';
        }
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('password').value;
        const res = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });
        if (res.ok) {
            document.getElementById('auth-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            loadData();
        } else {
            document.getElementById('auth-error').style.display = 'block';
        }
    });

    fetch('/api/admin/results').then(res => {
        if (res.ok) {
            document.getElementById('auth-view').style.display = 'none';
            document.getElementById('dashboard-view').style.display = 'block';
            loadData();
        }
    });

    const dlBtn = document.getElementById('download-csv-btn');
    if (dlBtn) {
        dlBtn.addEventListener('click', () => {
            window.location.href = '/api/admin/csv';
        });
    }
}

// ============================================================
// ── Bootstrap: run on DOMContentLoaded ──
// Every init function guards itself by checking for its own
// page's elements, so it is safe to call all of them on every page.
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    requireParticipant();
    initConsentPage();
    initOrientationPage();
    initTaskPage();
    initSurveyPage();
    initDonePage();
    initAdminPage();
});
```
<<<<<<< END FILE: study/public/app.js

---

>>>>>>> START FILE: study/public/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lume CHI Study</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <div class="logo">LUME <span class="badge">RESEARCH</span></div>
    </header>
    <main>
        <h2>Welcome to the Lume Study</h2>
        <div class="card">
            <p>This is a research study for an academic paper about a new way to write computer instructions using plain English. The session takes about 15–20 minutes. I'm not testing you — I'm testing the system. There are no wrong answers.</p>
            <p>We do not collect your name, email address, or any information that identifies you. You are assigned a random participant code when you begin. That code is the only identifier attached to your responses. Results appear in the research paper only as group averages and anonymous quotes.</p>
            <p>The only free-text field in the study is an optional comments box at the end. If you use it, avoid writing anything you'd prefer not to appear in a research paper — it is stored as you type it.</p>
            <p>You can stop at any time by closing the browser.</p>

            <label class="checkbox-label" style="margin-top: 2rem; margin-bottom: 0;">
                <input type="checkbox" id="age-check">
                <span>I confirm I am 18 years of age or older</span>
            </label>
            <p id="age-error" style="color: #ef4444; font-size: 0.85rem; margin-left: 2rem; display: none;">This study is open to participants aged 18 and over.</p>

            <label class="checkbox-label" style="margin-top: 0.5rem;">
                <input type="checkbox" id="consent-check">
                <span>I have read the above and agree to participate</span>
            </label>
        </div>

        <div id="screener-section" style="display: none;">
            <div class="card">
                <h3>Screener Question</h3>
                <p>Have you ever written computer code of any kind — including HTML, Python, JavaScript, Excel formulas, or anything similar?</p>
                <div class="radio-group">
                    <label class="checkbox-label"><input type="radio" name="screener" value="no"> No — I have never written code</label>
                    <label class="checkbox-label"><input type="radio" name="screener" value="yes"> Yes — I have some coding experience</label>
                </div>
            </div>

            <div id="screener-yes-msg" class="card" style="display: none; border-color: #ef4444;">
                <p style="color: #ef4444; margin: 0;">Thank you — this study is specifically for people with no prior coding experience. We appreciate your time!</p>
            </div>

            <div id="screener-no-msg" style="display: none; margin-top: 2rem;">
                <button id="begin-btn" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2.5rem;">Begin Study →</button>
            </div>
        </div>
    </main>

    <script src="/app.js"></script>
</body>
</html>
```
<<<<<<< END FILE: study/public/index.html

---

>>>>>>> START FILE: study/public/orientation.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orientation - Lume CHI Study</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <div class="logo">LUME <span class="badge">RESEARCH</span></div>
    </header>
    <main>
        <h2>Before we begin</h2>
        <p>You're going to write some simple instructions for a computer. Don't worry about syntax or rules — just write what feels natural.</p>
        <p>Here's an example of a Lume instruction:</p>

        <div class="code-block">show "I am learning Lume"</div>

        <p>When you run this, the computer displays: <strong>I am learning Lume</strong></p>

        <div class="card" style="margin-top: 2rem;">
            <p>That's all Lume is — plain instructions in plain English. You'll write four of them. Each one has a 4-minute time limit. Do your best, and don't worry if something doesn't work — that's useful information too.</p>
            <p>Each task has a 4-minute limit — don't worry about it, the page moves on automatically when time's up.</p>
        </div>

        <div style="margin-top: 3rem; margin-bottom: 2rem;">
            <h3>Try it yourself</h3>
            <p>No pressure — just see what happens. Type a Lume instruction and click Run.</p>
            <textarea id="practice-editor" class="editor-box" placeholder='e.g. show "hello"' rows="3" style="width: 100%; margin-top: 0.5rem;"></textarea>
            <button id="practice-run-btn" class="btn btn-primary" style="margin-top: 1rem;">Run ▶</button>
            <div id="practice-output" class="output-panel" style="display: none; margin-top: 1rem;">
                <h4>Output</h4>
                <pre id="practice-output-text"></pre>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <a href="/task/1" class="btn btn-primary">Start Task 1 →</a>
        </div>
    </main>
    <script src="/app.js"></script>
</body>
</html>
```
<<<<<<< END FILE: study/public/orientation.html

---

>>>>>>> START FILE: study/public/task.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task - Lume CHI Study</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <div class="logo">LUME <span class="badge">RESEARCH</span></div>
    </header>
    <main>
        <span class="task-indicator" id="task-label">TASK 1 OF 4</span>
        <h2 id="task-title"></h2>
        <p id="task-desc"></p>

        <div class="task-layout">
            <div>
                <div class="card" id="prompt-card">
                    <h3>Your Task</h3>
                    <p id="task-prompt" style="color: #fff; font-size: 1.05rem;"></p>
                    <div id="task-hint" style="margin-top: 1rem; padding: 1rem; background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.15); border-radius: 6px; font-size: 0.9rem; color: var(--text-secondary);"></div>
                </div>

                <div class="timer" id="timer" style="display: none;">4:00</div>
            </div>

            <div>
                <textarea class="editor" id="code-editor" placeholder="Type your Lume instructions here..." spellcheck="false"></textarea>

                <div class="actions" style="margin-top: 1rem; display: flex; gap: 1rem;">
                    <button class="btn btn-primary" id="run-btn">Run ▶</button>
                    <button class="btn btn-secondary" id="skip-btn">Skip Task →</button>
                </div>

                <div id="output-panel" class="output-panel" style="display: none;">
                    <span style="color: var(--accent-cyan); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;">Output</span>
                    <div id="output-text" style="margin-top: 0.5rem;"></div>
                </div>
            </div>
        </div>

        <div id="next-section" style="display: none; margin-top: 2rem; text-align: center;">
            <div class="card" style="border-color: rgba(6, 182, 212, 0.2);">
                <p style="color: #fff; margin-bottom: 1rem;" id="result-msg"></p>
                <button class="btn btn-primary" id="next-btn">Continue →</button>
            </div>
        </div>
    </main>

    <script src="/app.js"></script>
</body>
</html>
```
<<<<<<< END FILE: study/public/task.html

---

>>>>>>> START FILE: study/public/survey.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Survey - Lume CHI Study</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <div class="logo">LUME <span class="badge">RESEARCH</span></div>
    </header>
    <main>
        <h2>Almost done — a few quick questions</h2>
        <p>For each statement, select how much you agree or disagree about the Lume system you just used.</p>

        <form id="survey-form" style="margin-top: 3rem;">
            <div id="sus-container"></div>

            <div class="card" style="margin-top: 2rem;">
                <h3>Is there anything else you'd like to say about the experience?</h3>
                <textarea id="comments" class="editor" style="height: 100px; margin-top: 1rem; background: rgba(0,0,0,0.3);" placeholder="(Optional)"></textarea>
            </div>

            <button type="submit" id="submit-btn" class="btn btn-primary">Submit →</button>
        </form>
    </main>

    <script src="/app.js"></script>
</body>
</html>
```
<<<<<<< END FILE: study/public/survey.html

---

>>>>>>> START FILE: study/public/done.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete - Lume CHI Study</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <div class="logo">LUME <span class="badge">RESEARCH</span></div>
    </header>
    <main style="text-align: center; padding-top: 4rem;">
        <h2>Thank you!</h2>
        <div class="card" style="max-width: 600px; margin: 2rem auto;">
            <p style="font-size: 1.15rem; color: #fff;">Your responses have been recorded.</p>
            <p>Your participant code was: <strong id="pid-display" style="font-family: var(--font-mono); color: var(--accent-cyan);"></strong></p>
            <p>You can save this code if you ever want to contact us about your responses. Otherwise, you're all done.</p>
            <p style="margin-top: 2rem; color: var(--text-secondary); font-size: 0.9rem;">This study is part of ongoing research into natural-language programming. Thank you for contributing to this work.</p>
        </div>
        <p style="margin-top: 2rem; color: var(--text-secondary);">You can safely close this window.</p>
    </main>
    <script src="/app.js"></script>
</body>
</html>
```
<<<<<<< END FILE: study/public/done.html

---

>>>>>>> START FILE: study/public/admin.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Lume CHI Study</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header>
        <div class="logo">LUME <span class="badge">ADMIN</span></div>
    </header>
    <main style="max-width: 1200px;">
        <div id="auth-view">
            <h2>Authentication Required</h2>
            <form id="auth-form" style="margin-top: 2rem;">
                <input type="password" id="password" placeholder="Admin Password" required>
                <button type="submit" class="btn btn-primary" style="margin-top: 1rem; display: block;">Login</button>
            </form>
            <p id="auth-error" style="color: #ef4444; margin-top: 1rem; display: none;">Invalid password</p>
        </div>

        <div id="dashboard-view" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Study Results</h2>
                <button id="download-csv-btn" class="btn btn-primary">Download CSV</button>
            </div>

            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-label">Total Participants</div>
                    <div class="stat-value" id="stat-total">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Task 1 Completion</div>
                    <div class="stat-value" id="stat-t1">0%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Task 2 Completion</div>
                    <div class="stat-value" id="stat-t2">0%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Task 3 Completion</div>
                    <div class="stat-value" id="stat-t3">0%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Task 4 Completion</div>
                    <div class="stat-value" id="stat-t4">0%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Mean SUS Score</div>
                    <div class="stat-value" id="stat-sus">0.0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Mean Time (Completed)</div>
                    <div class="stat-value" id="stat-time">0.0s</div>
                </div>
            </div>

            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>T1</th>
                            <th>T2</th>
                            <th>T3</th>
                            <th>T4</th>
                            <th>SUS</th>
                            <th>Comments <br><span style="font-size:0.7rem; font-weight:normal; color:#ef4444; letter-spacing:0;">(Optional comment (may contain personal information — handle with care))</span></th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <!-- Rows injected here -->
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <script src="/app.js"></script>
</body>
</html>
```
<<<<<<< END FILE: study/public/admin.html

---

## STEP-BY-STEP

1. `git checkout main && git pull` in the `lume` repo to make sure you're
   starting from the current live state.
2. For each of the 7 files above, replace the corresponding file in
   `study/public/` with the exact content between its START/END markers.
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
