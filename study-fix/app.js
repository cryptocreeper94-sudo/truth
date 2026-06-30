// ============================================================
// Lume CHI Study — Shared App Logic
// All page-specific logic lives here (CSP requires no inline scripts)
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
            title: "Create a list and display items",
            prompt: "Create a list of three favorite foods and display each one.",
            hint: 'In Lume: <code>define foods = ["pizza", "tacos", "sushi"]</code> then <code>for each food in foods</code> and <code>show food</code>',
            check: (code, output) => (code.includes('[') || code.toLowerCase().includes('list')) && (code.toLowerCase().includes('for') || code.toLowerCase().includes('show'))
        }
    ];

    const taskNum = parseInt(window.location.pathname.split('/').pop()) || 1;
    const taskIndex = taskNum - 1;
    const task = tasks[taskIndex] || tasks[0];

    document.getElementById('task-label').textContent = `TASK ${taskNum} OF 4`;
    document.getElementById('task-title').textContent = task.title;
    document.getElementById('task-prompt').textContent = task.prompt;
    document.getElementById('task-hint').innerHTML = task.hint;

    // ── Timer ──
    let timeLeft = 240;
    let timerInterval;
    const timerEl = document.getElementById('timer');

    function updateTimer() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

        if (timeLeft <= 60) timerEl.classList.add('warning');
        if (timeLeft <= 15) timerEl.classList.add('danger');

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTask(false);
        }
        timeLeft--;
    }

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // ── Simple Lume Interpreter ──
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
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    requireParticipant();
    initConsentPage();
    initTaskPage();
    initSurveyPage();
    initDonePage();
    initAdminPage();
});
