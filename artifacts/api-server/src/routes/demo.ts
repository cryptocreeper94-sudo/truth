import { Router, type Request, type Response } from "express";

const router = Router();

// ── Compose demo HTML ────────────────────────────────────────────────────────
function composeDemoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document Composer — Axiom</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0a; --surface: #111; --surface2: #161616; --border: rgba(255,255,255,.08);
      --border-hi: rgba(255,255,255,.18); --text: #e5e5e5; --muted: rgba(255,255,255,.4);
      --dim: rgba(255,255,255,.22); --accent: #7c3aed; --accent-lo: rgba(124,58,237,.15);
      --accent-hi: rgba(124,58,237,.35); --green: #22c55e; --red: #ef4444;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }

    /* ── Header ── */
    header { border-bottom: 1px solid var(--border); padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: rgba(10,10,10,.92); backdrop-filter: blur(12px); z-index: 100; }
    .logo { font-family: 'Courier New', monospace; font-size: 15px; font-weight: 700; letter-spacing: .12em; }
    .logo span { color: var(--accent); }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .status-pill { font-size: 11px; font-family: monospace; color: var(--muted); border: 1px solid var(--border-hi); padding: 3px 10px; border-radius: 4px; display: flex; align-items: center; gap: 6px; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    .nav-link { font-size: 12px; color: var(--muted); text-decoration: none; font-family: monospace; }
    .nav-link:hover { color: var(--text); }

    /* ── Layout ── */
    .page { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }

    /* ── Section label ── */
    .section-label { font-family: monospace; font-size: 10px; letter-spacing: .16em; color: var(--accent); text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .section-label::before { content: ''; display: block; width: 3px; height: 3px; background: var(--accent); border-radius: 50%; }

    /* ── Template picker ── */
    #template-section { margin-bottom: 40px; }
    .template-toggle { display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 14px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; user-select: none; transition: border-color .15s; }
    .template-toggle:hover { border-color: var(--border-hi); }
    .template-toggle-left { display: flex; align-items: center; gap: 10px; }
    .template-toggle-title { font-weight: 600; font-size: 14px; }
    .template-toggle-sub { font-size: 12px; color: var(--muted); }
    .template-toggle-badge { font-size: 10px; font-family: monospace; background: var(--accent-lo); color: var(--accent); border: 1px solid var(--accent-hi); padding: 2px 8px; border-radius: 4px; }
    .template-toggle-arrow { font-size: 12px; color: var(--muted); transition: transform .2s; }
    .template-toggle-arrow.open { transform: rotate(180deg); }

    .template-grid-wrap { overflow: hidden; max-height: 0; transition: max-height .35s cubic-bezier(.4,0,.2,1); }
    .template-grid-wrap.open { max-height: 1200px; }
    .template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; padding: 16px 0 0; }

    .tpl-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; cursor: pointer; transition: border-color .15s, background .15s, transform .1s; }
    .tpl-card:hover { border-color: var(--accent-hi); background: var(--surface2); transform: translateY(-1px); }
    .tpl-card.active { border-color: var(--accent); background: var(--accent-lo); }
    .tpl-icon { font-size: 22px; margin-bottom: 8px; }
    .tpl-cat { font-size: 9px; font-family: monospace; letter-spacing: .14em; color: var(--accent); text-transform: uppercase; margin-bottom: 4px; }
    .tpl-name { font-size: 13px; font-weight: 600; line-height: 1.3; margin-bottom: 6px; }
    .tpl-desc { font-size: 11px; color: var(--muted); line-height: 1.5; }

    /* ── Workspace ── */
    #workspace { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 720px) { #workspace { grid-template-columns: 1fr; } }

    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .panel-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .panel-title { font-size: 12px; font-weight: 600; font-family: monospace; letter-spacing: .06em; }
    .panel-hint { font-size: 11px; color: var(--dim); }
    textarea { width: 100%; resize: vertical; background: transparent; border: none; outline: none; color: var(--text); font-size: 13px; line-height: 1.7; padding: 16px; font-family: 'Courier New', monospace; min-height: 280px; }
    textarea::placeholder { color: var(--dim); }

    /* ── Intent selector ── */
    #intent-row { margin-bottom: 20px; }
    .intent-label { font-size: 12px; color: var(--muted); font-family: monospace; margin-bottom: 10px; display: block; }
    .intent-pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .intent-pill { padding: 6px 14px; font-size: 12px; font-family: monospace; border: 1px solid var(--border); border-radius: 5px; cursor: pointer; background: var(--surface); color: var(--muted); transition: all .15s; user-select: none; }
    .intent-pill:hover { border-color: var(--border-hi); color: var(--text); }
    .intent-pill.active { border-color: var(--accent); background: var(--accent-lo); color: var(--text); }

    /* ── Actions ── */
    .action-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .btn { height: 40px; padding: 0 20px; border: none; cursor: pointer; font-size: 13px; font-family: monospace; font-weight: 600; letter-spacing: .05em; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; transition: all .15s; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: #6d28d9; }
    .btn-primary:disabled { opacity: .45; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .btn-ghost:hover { border-color: var(--border-hi); color: var(--text); }
    .quota-tag { font-size: 11px; font-family: monospace; color: var(--dim); margin-left: auto; }

    /* ── Result ── */
    #result-section { display: none; }
    .result-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .result-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .result-title { font-size: 12px; font-weight: 600; font-family: monospace; letter-spacing: .06em; }
    .result-actions { display: flex; gap: 8px; }
    .result-body { padding: 20px; }
    #result-text { white-space: pre-wrap; font-size: 13px; line-height: 1.75; font-family: 'Courier New', monospace; color: rgba(255,255,255,.82); }

    /* ── Error / loading ── */
    .toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface2); border: 1px solid var(--border-hi); border-radius: 8px; padding: 12px 18px; font-size: 13px; z-index: 999; max-width: 340px; display: none; }
    .toast.err { border-color: var(--red); color: #fca5a5; }
    .toast.ok { border-color: var(--green); color: #86efac; }

    .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Footer ── */
    footer { border-top: 1px solid var(--border); padding: 20px 24px; text-align: center; font-size: 11px; color: var(--dim); font-family: monospace; }
  </style>
</head>
<body>

<header>
  <div class="logo">AXIOM<span>.SYS</span></div>
  <div class="header-right">
    <div class="status-pill"><div class="status-dot"></div> COMPOSER ONLINE</div>
    <a class="nav-link" href="/">← HOME</a>
  </div>
</header>

<div class="page">

  <!-- ── Template picker ── -->
  <section id="template-section">
    <div class="section-label">INITIALIZE</div>
    <div class="template-toggle" id="tpl-toggle">
      <div class="template-toggle-left">
        <div>
          <div class="template-toggle-title">Start from a Template</div>
          <div class="template-toggle-sub">Pre-filled structures for 10 proven document types</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="template-toggle-badge">10 TEMPLATES</span>
        <span class="template-toggle-arrow" id="tpl-arrow">▾</span>
      </div>
    </div>

    <div class="template-grid-wrap" id="tpl-grid-wrap">
      <div class="template-grid" id="tpl-grid">
        <!-- injected by JS -->
      </div>
    </div>
  </section>

  <!-- ── Intent selector ── -->
  <div id="intent-row">
    <span class="intent-label">// OPERATION MODE</span>
    <div class="intent-pills">
      <div class="intent-pill active" data-intent="tailor">TAILOR RESUME</div>
      <div class="intent-pill" data-intent="apply">COVER LETTER</div>
      <div class="intent-pill" data-intent="follow_up">FOLLOW-UP</div>
      <div class="intent-pill" data-intent="network">OUTREACH</div>
      <div class="intent-pill" data-intent="referral">REFERRAL</div>
    </div>
  </div>

  <!-- ── Workspace ── -->
  <div id="workspace">
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">YOUR DOCUMENT</span>
        <span class="panel-hint">Resume, cover letter, or message</span>
      </div>
      <textarea id="doc-input" placeholder="Paste your resume or document here — or pick a template above to get started quickly."></textarea>
    </div>
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">TARGET CONTEXT</span>
        <span class="panel-hint">Job description, company, or goal</span>
      </div>
      <textarea id="ctx-input" placeholder="Paste the job description or describe the role, company, and position you're targeting. The more context you give, the sharper the output."></textarea>
    </div>
  </div>

  <!-- ── Action bar ── -->
  <div class="action-bar">
    <button class="btn btn-primary" id="compose-btn">
      <span id="btn-label">⚡ EXECUTE COMPOSE</span>
    </button>
    <button class="btn btn-ghost" id="clear-btn">CLEAR</button>
    <span class="quota-tag" id="quota-display"></span>
  </div>

  <!-- ── Result ── -->
  <section id="result-section">
    <div class="section-label">OUTPUT</div>
    <div class="result-panel">
      <div class="result-header">
        <span class="result-title" id="result-title">COMPOSED DOCUMENT</span>
        <div class="result-actions">
          <button class="btn btn-ghost" id="copy-btn" style="height:32px;font-size:11px;">📋 COPY</button>
          <button class="btn btn-ghost" id="dl-btn" style="height:32px;font-size:11px;">⬇ TXT</button>
          <button class="btn btn-ghost" id="dl-pdf-btn" style="height:32px;font-size:11px;">⬇ PDF</button>
          <button class="btn btn-ghost" id="share-btn" style="height:32px;font-size:11px;">🔗 SHARE</button>
        </div>
      </div>
      <div class="result-body">
        <pre id="result-text"></pre>
      </div>
    </div>
  </section>

</div>

<div class="toast" id="toast"></div>

<footer>AXIOM<span style="color:var(--accent)">.SYS</span> COMPOSER · CLASSIFIED-GRADE PRECISION</footer>

<script>
// ── Template data ────────────────────────────────────────────────────────────
var TEMPLATES = [
  {
    id: 'se-resume',
    icon: '💻',
    category: 'RESUME',
    name: 'Software Engineer',
    desc: 'Senior IC resume with systems focus',
    intent: 'tailor',
    body: [
      '[Full Name]',
      '[email@domain.com] · [555-000-0000] · linkedin.com/in/[handle] · github.com/[handle]',
      '',
      'SUMMARY',
      'Senior Software Engineer with [X]+ years building high-throughput distributed systems. Deep expertise in [languages/frameworks]. Track record of reducing latency, improving reliability, and shipping products used by millions.',
      '',
      'EXPERIENCE',
      '',
      'Senior Software Engineer | [Company] | [Month Year] – Present',
      '· Led end-to-end development of [system/feature] handling [X]M requests/day',
      '· Reduced p99 latency by [X]% through [specific optimization]',
      '· Designed [architecture component] adopted by [X] teams across [org]',
      '· Mentored [X] engineers; drove [initiative] that improved deploy frequency by [X]%',
      '',
      'Software Engineer | [Company] | [Month Year] – [Month Year]',
      '· Built [feature] in [tech stack], improving [metric] by [X]%',
      '· Owned on-call rotation for [service]; reduced MTTR from [X] to [X] hours',
      '· Shipped [feature] to [X]K users in [timeframe]',
      '',
      'SKILLS',
      'Languages: Python, TypeScript, Go, Java',
      'Frameworks: React, Node.js, FastAPI, Spring Boot',
      'Infrastructure: AWS (ECS, Lambda, RDS), GCP, Kubernetes, Terraform, Datadog',
      '',
      'EDUCATION',
      'B.S. / M.S. Computer Science | [University] | [Year]'
    ].join('\n')
  },
  {
    id: 'pm-resume',
    icon: '🗺️',
    category: 'RESUME',
    name: 'Product Manager',
    desc: 'Growth-focused PM with metric outcomes',
    intent: 'tailor',
    body: [
      '[Full Name]',
      '[email@domain.com] · [555-000-0000] · linkedin.com/in/[handle]',
      '',
      'SUMMARY',
      'Product Manager with [X]+ years driving 0-to-1 and scaling product lines. Expert in translating ambiguous business goals into clear roadmaps, aligning cross-functional teams, and delivering measurable outcomes.',
      '',
      'EXPERIENCE',
      '',
      'Senior Product Manager | [Company] | [Month Year] – Present',
      '· Owned [product area] with [X]M MAU; grew engagement by [X]% YoY',
      '· Defined and shipped [feature set] from discovery to GA in [X] months',
      '· Partnered with Engineering, Design, and Data to establish [process/ritual]',
      '· Drove [X]% improvement in [key metric] through [A/B test or initiative]',
      '',
      'Product Manager | [Company] | [Month Year] – [Month Year]',
      '· Launched [product/feature] that generated $[X]M in incremental ARR',
      '· Reduced churn by [X]% by identifying and closing [gap] via user research',
      '· Managed roadmap for [X] engineers across [X] teams',
      '',
      'SKILLS',
      'Strategy: Roadmapping, OKRs, PRDs, Go-to-Market',
      'Analytics: SQL, Amplitude, Mixpanel, Looker',
      'Tools: Jira, Figma, Notion, Linear',
      '',
      'EDUCATION',
      'B.S. [Field] | [University] | [Year]',
      'MBA | [Business School] | [Year] (if applicable)'
    ].join('\n')
  },
  {
    id: 'data-analyst-resume',
    icon: '📊',
    category: 'RESUME',
    name: 'Data Analyst / Scientist',
    desc: 'Insight-driven analyst resume with impact numbers',
    intent: 'tailor',
    body: [
      '[Full Name]',
      '[email@domain.com] · [555-000-0000] · linkedin.com/in/[handle] · [portfolio or Kaggle URL]',
      '',
      'SUMMARY',
      'Data Analyst / Scientist with [X]+ years turning raw data into decisions. Skilled in end-to-end analytics: from data pipeline design to stakeholder-facing dashboards and predictive models.',
      '',
      'EXPERIENCE',
      '',
      'Senior Data Analyst | [Company] | [Month Year] – Present',
      '· Built [X] self-serve dashboards reducing ad-hoc requests by [X]%',
      '· Developed [model/analysis] that improved [business metric] by $[X]M annually',
      '· Partnered with [team] to define [KPI framework]; rolled out to [X] teams',
      '· Automated [process] via [tool/script], saving [X] hours/week',
      '',
      'Data Analyst | [Company] | [Month Year] – [Month Year]',
      '· Maintained and optimized [X] ETL pipelines processing [X]TB/day',
      '· Delivered [insight/analysis] that directly influenced [decision/initiative]',
      '· Performed A/B test analysis for [X] experiments; surfaced [finding]',
      '',
      'TECHNICAL SKILLS',
      'Languages: Python (pandas, scikit-learn, matplotlib), R, SQL',
      'Tools: BigQuery, Snowflake, dbt, Tableau, Looker, Airflow',
      'Methods: Regression, Classification, Clustering, A/B Testing, Forecasting',
      '',
      'EDUCATION',
      'B.S. / M.S. Statistics, Computer Science, or related | [University] | [Year]'
    ].join('\n')
  },
  {
    id: 'cover-letter',
    icon: '📄',
    category: 'COVER LETTER',
    name: 'Standard Cover Letter',
    desc: 'Structured three-paragraph application letter',
    intent: 'apply',
    body: [
      '[Your Name]',
      '[Your Address] · [City, State ZIP] · [email@domain.com]',
      '[Date]',
      '',
      'Hiring Manager',
      '[Company Name]',
      '[Company Address]',
      '',
      'Dear Hiring Manager,',
      '',
      'I am writing to express my strong interest in the [Job Title] role at [Company Name]. With [X] years of experience in [relevant field/skill], I have developed a track record of [core strength 1] and [core strength 2] that I believe aligns directly with what your team is building.',
      '',
      'In my current role at [Current Company], I [specific accomplishment with metrics]. Previously at [Prior Company], I [another accomplishment demonstrating relevant skill]. These experiences have prepared me to [contribute to specific team goal or challenge the company faces].',
      '',
      'I am particularly excited about [Company Name] because [genuine, specific reason — product, mission, team, market position]. I am confident I can contribute meaningfully from day one and would welcome the opportunity to discuss how my background fits your needs.',
      '',
      'Thank you for your time and consideration.',
      '',
      'Sincerely,',
      '[Your Name]'
    ].join('\n')
  },
  {
    id: 'career-change-cover',
    icon: '🔄',
    category: 'COVER LETTER',
    name: 'Career Change Cover Letter',
    desc: 'Bridges transferable skills across industries',
    intent: 'apply',
    body: [
      '[Your Name]',
      '[email@domain.com] · [Phone] · [LinkedIn]',
      '',
      'Dear Hiring Manager,',
      '',
      'My path to [Target Role] at [Company] is unconventional — and I believe that is precisely what makes me a strong candidate.',
      '',
      'For the past [X] years I have worked in [Previous Industry/Role], where I developed deep expertise in [Skill 1], [Skill 2], and [Skill 3]. While my title has been [Previous Title], the substance of my work mirrors what [Target Role] demands: [connect a key responsibility from the new role to your past work with a concrete example].',
      '',
      'I made the deliberate decision to move into [Target Industry/Role] because [authentic reason — interest, market shift, problem you want to solve]. To prepare, I have [action taken: coursework, side project, certification, freelance work] — specifically [name what you built or learned and why it is relevant].',
      '',
      'What I bring that career-track candidates may not: [unique cross-industry perspective or transferable insight, stated concisely]. I have seen how [something from your background] informs [the new field] in ways that are not obvious from the inside.',
      '',
      'I would welcome the chance to discuss how my background translates to value on your team.',
      '',
      'Sincerely,',
      '[Your Name]'
    ].join('\n')
  },
  {
    id: 'cold-outreach',
    icon: '📡',
    category: 'EMAIL',
    name: 'Cold Outreach Email',
    desc: 'Direct, respect-first cold networking email',
    intent: 'network',
    body: [
      'Subject: [Specific hook — question, observation, or shared context — max 8 words]',
      '',
      'Hi [First Name],',
      '',
      'I will keep this short.',
      '',
      '[One sentence establishing credibility or shared context — who you are, one relevant fact about your background, or a specific observation about their work.]',
      '',
      'I am [what you are doing / exploring / building] and I think your perspective on [specific topic] would be genuinely useful to me. I have [done something relevant — read their content, used their product, followed their work] and have a specific question: [the actual question, phrased concisely].',
      '',
      'If you have 20 minutes for a call in the next few weeks, I would be grateful. No agenda beyond that question and whatever direction you want to take it.',
      '',
      '[Your Name]',
      '[Title / Company]',
      '[LinkedIn or portfolio URL]'
    ].join('\n')
  },
  {
    id: 'linkedin-note',
    icon: '🔗',
    category: 'LINKEDIN',
    name: 'LinkedIn Connection Note',
    desc: 'Personalized 300-character connection request',
    intent: 'network',
    body: [
      'LinkedIn Connection Note (300 character limit — trim as needed):',
      '',
      'Hi [First Name], I came across your work on [specific thing — post, company, project]. I am [one-line context on who you are] and I am building [or exploring] [something relevant]. Would love to connect and follow your work.',
      '',
      '---',
      '',
      'FOLLOW-UP MESSAGE (send 3–5 days after connecting, if no response):',
      '',
      'Hi [First Name], thanks for connecting. Following up on my earlier note — I had a specific question about [topic]. Happy to share more context on what I am working on first. Would a 15-minute call work at some point?'
    ].join('\n')
  },
  {
    id: 'post-interview-followup',
    icon: '✅',
    category: 'EMAIL',
    name: 'Post-Interview Follow-up',
    desc: 'Thank-you note that reinforces your candidacy',
    intent: 'follow_up',
    body: [
      'Subject: Thank you — [Your Name] / [Role] Interview',
      '',
      'Hi [Interviewer First Name],',
      '',
      'Thank you for the time today. I enjoyed learning about [something specific discussed — team structure, technical challenge, product direction].',
      '',
      'Our conversation reinforced my interest in the role. Specifically, when you mentioned [specific point or problem they raised], I thought about [your experience or idea that connects to it directly]. I wanted to share that [brief elaboration — 2–3 sentences max — that adds value, not just restates what you said in the interview].',
      '',
      'I remain very interested in [Company] and the [Team/Role]. Please let me know if there is any additional information I can provide.',
      '',
      'Looking forward to hearing about next steps.',
      '',
      'Best,',
      '[Your Name]',
      '[Phone] · [LinkedIn]'
    ].join('\n')
  },
  {
    id: 'policy-memo',
    icon: '🏛️',
    category: 'POLICY',
    name: 'Policy Memo',
    desc: 'Executive-ready policy brief for decision-makers',
    intent: 'tailor',
    body: [
      'MEMORANDUM',
      '',
      'TO:      [Recipient Name / Title]',
      'FROM:    [Author Name / Title]',
      'DATE:    [Date]',
      'SUBJECT: [Issue — brief, specific, action-oriented]',
      '',
      'EXECUTIVE SUMMARY',
      '[2–3 sentences. State the issue, the recommended action, and the key rationale. Decision-makers may read only this section.]',
      '',
      'BACKGROUND',
      '[Concise context: what changed, why this matters now, what prior actions or decisions are relevant. Cite sources by reference number if applicable. 2–4 sentences.]',
      '',
      'ANALYSIS',
      '[Present the problem or decision space. Summarize 2–3 options with tradeoffs:]',
      '',
      'Option A — [Name]: [Description]. Pros: [X]. Cons: [Y].',
      'Option B — [Name]: [Description]. Pros: [X]. Cons: [Y].',
      'Option C — [Name]: [Description]. Pros: [X]. Cons: [Y].',
      '',
      'RECOMMENDATION',
      '[State the recommended option clearly. Explain the primary rationale in 2–3 sentences. Include any key caveats or conditions.]',
      '',
      'NEXT STEPS',
      '1. [Immediate action, owner, deadline]',
      '2. [Follow-on action]',
      '3. [Review / check-in milestone]',
      '',
      'ATTACHMENTS: [List any supporting documents]'
    ].join('\n')
  },
  {
    id: 'exec-summary',
    icon: '📋',
    category: 'STRATEGY',
    name: 'Executive Summary',
    desc: 'One-page strategic brief for senior stakeholders',
    intent: 'tailor',
    body: [
      '[DOCUMENT TITLE]',
      'Executive Summary · [Date] · [Author / Team]',
      '',
      'SITUATION',
      '[What is the current state? What problem, opportunity, or decision is this document addressing? 2–3 sentences. Be specific — avoid jargon.]',
      '',
      'OBJECTIVE',
      '[What outcome are we pursuing? Quantify if possible: "increase [metric] by [X]% by [date]" or "decide whether to [action] by [date]."]',
      '',
      'KEY FINDINGS',
      '· [Finding 1 — data point or observation that directly informs the recommendation]',
      '· [Finding 2 — constraint, risk, or dependency]',
      '· [Finding 3 — competitive, market, or operational context]',
      '',
      'RECOMMENDATION',
      '[Single clear recommendation, stated in one sentence. Then 2–3 sentences of supporting rationale.]',
      '',
      'RESOURCE REQUIREMENTS',
      '· Budget: $[X]',
      '· Timeline: [X] weeks / months',
      '· Headcount: [X] FTE / [X] contractor',
      '',
      'RISKS & MITIGATIONS',
      '· [Risk 1]: Mitigated by [action].',
      '· [Risk 2]: Accepted / monitored via [mechanism].',
      '',
      'DECISION NEEDED BY: [Date]',
      'SPONSOR: [Name / Title]',
      'OWNER: [Name / Title]'
    ].join('\n')
  }
];

// ── State ────────────────────────────────────────────────────────────────────
var selectedIntent = 'tailor';
var activeTemplateId = null;
var quotaRemaining = null;

// ── DOM refs ─────────────────────────────────────────────────────────────────
var docInput    = document.getElementById('doc-input');
var ctxInput    = document.getElementById('ctx-input');
var composeBtn  = document.getElementById('compose-btn');
var btnLabel    = document.getElementById('btn-label');
var clearBtn    = document.getElementById('clear-btn');
var resultSec   = document.getElementById('result-section');
var resultText  = document.getElementById('result-text');
var resultTitle = document.getElementById('result-title');
var quotaDisp   = document.getElementById('quota-display');
var toastEl     = document.getElementById('toast');
var copyBtn     = document.getElementById('copy-btn');
var dlBtn       = document.getElementById('dl-btn');
var dlPdfBtn    = document.getElementById('dl-pdf-btn');
var shareBtn    = document.getElementById('share-btn');

// ── Template grid ─────────────────────────────────────────────────────────────
function renderTemplateGrid() {
  var grid = document.getElementById('tpl-grid');
  grid.innerHTML = TEMPLATES.map(function(t) {
    return '<div class="tpl-card" data-id="' + t.id + '">' +
      '<div class="tpl-icon">' + t.icon + '</div>' +
      '<div class="tpl-cat">' + t.category + '</div>' +
      '<div class="tpl-name">' + t.name + '</div>' +
      '<div class="tpl-desc">' + t.desc + '</div>' +
      '</div>';
  }).join('');

  grid.querySelectorAll('.tpl-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var id = card.getAttribute('data-id');
      applyTemplate(id);
    });
  });
}

function applyTemplate(id) {
  var tpl = TEMPLATES.find(function(t) { return t.id === id; });
  if (!tpl) return;

  // Populate textarea
  docInput.value = tpl.body;

  // Set intent
  setIntent(tpl.intent);

  // Mark card active
  document.querySelectorAll('.tpl-card').forEach(function(c) {
    c.classList.toggle('active', c.getAttribute('data-id') === id);
  });
  activeTemplateId = id;

  // Collapse template grid and scroll to workspace
  closeTplGrid();
  document.getElementById('intent-row').scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast('Template loaded — add your target context on the right, then execute.', 'ok');
}

// ── Template toggle ───────────────────────────────────────────────────────────
var tplOpen = false;
document.getElementById('tpl-toggle').addEventListener('click', function() {
  tplOpen = !tplOpen;
  document.getElementById('tpl-grid-wrap').classList.toggle('open', tplOpen);
  document.getElementById('tpl-arrow').classList.toggle('open', tplOpen);
});

function closeTplGrid() {
  tplOpen = false;
  document.getElementById('tpl-grid-wrap').classList.remove('open');
  document.getElementById('tpl-arrow').classList.remove('open');
}

// ── Intent pills ──────────────────────────────────────────────────────────────
document.querySelectorAll('.intent-pill').forEach(function(pill) {
  pill.addEventListener('click', function() {
    setIntent(pill.getAttribute('data-intent'));
  });
});

function setIntent(intent) {
  selectedIntent = intent;
  document.querySelectorAll('.intent-pill').forEach(function(p) {
    p.classList.toggle('active', p.getAttribute('data-intent') === intent);
  });
}

// ── Clear ─────────────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', function() {
  docInput.value = '';
  ctxInput.value = '';
  resultSec.style.display = 'none';
  document.querySelectorAll('.tpl-card').forEach(function(c) { c.classList.remove('active'); });
  activeTemplateId = null;
});

// ── Compose ───────────────────────────────────────────────────────────────────
composeBtn.addEventListener('click', function() {
  var doc = docInput.value.trim();
  var ctx = ctxInput.value.trim();
  if (!doc) { showToast('Paste your document or select a template first.', 'err'); return; }
  if (!ctx) { showToast('Add a target context on the right to continue.', 'err'); return; }
  runCompose(doc, ctx);
});

function runCompose(doc, ctx) {
  composeBtn.disabled = true;
  btnLabel.innerHTML = '<span class="spinner"></span> PROCESSING...';

  fetch('/api/v1/compose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent: selectedIntent, document: doc, context: ctx, missingKeywords: [] })
  })
  .then(function(res) {
    if (!res.ok) {
      return res.json().then(function(body) {
        throw new Error(body.detail || body.error || ('Error ' + res.status));
      });
    }
    return res.json();
  })
  .then(function(data) {
    showResult(data.result_text);
    quotaRemaining = data.remaining;
    updateQuota();
  })
  .catch(function(err) {
    showToast(err.message || 'Compose failed. Please try again.', 'err');
  })
  .finally(function() {
    composeBtn.disabled = false;
    btnLabel.textContent = '⚡ EXECUTE COMPOSE';
  });
}

function showResult(text) {
  resultText.textContent = text;
  var intentLabels = {
    tailor: 'TAILORED RESUME', apply: 'COVER LETTER',
    follow_up: 'FOLLOW-UP EMAIL', network: 'OUTREACH MESSAGE', referral: 'REFERRAL MESSAGE'
  };
  resultTitle.textContent = intentLabels[selectedIntent] || 'COMPOSED DOCUMENT';
  resultSec.style.display = 'block';
  resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Copy / Download / Share ───────────────────────────────────────────────────
copyBtn.addEventListener('click', function() {
  var text = resultText.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    copyBtn.textContent = '✓ COPIED';
    setTimeout(function() { copyBtn.innerHTML = '&#128203; COPY'; }, 2000);
  });
});

dlBtn.addEventListener('click', function() {
  var text = resultText.textContent;
  if (!text) return;
  var blob = new Blob([text], { type: 'text/plain' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  var intentSlug = selectedIntent.replace('_', '-');
  a.href = url; a.download = 'axiom-' + intentSlug + '.txt'; a.click();
  URL.revokeObjectURL(url);
});

dlPdfBtn.addEventListener('click', function() {
  var text = resultText.textContent;
  if (!text) return;
  var intentSlug = selectedIntent.replace(/_/g, '-');
  var filename = 'axiom-' + intentSlug;
  dlPdfBtn.textContent = '...';
  dlPdfBtn.disabled = true;
  fetch('/api/v1/export-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text, filename: filename })
  })
  .then(function(res) {
    if (!res.ok) {
      return res.json().then(function(body) {
        throw new Error(body.detail || body.error || ('Error ' + res.status));
      });
    }
    return res.arrayBuffer();
  })
  .then(function(buffer) {
    var blob = new Blob([buffer], { type: 'application/pdf' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url; a.download = filename + '.pdf'; a.click();
    URL.revokeObjectURL(url);
  })
  .catch(function(err) {
    showToast(err.message || 'PDF export failed. Please try again.', 'err');
  })
  .finally(function() {
    dlPdfBtn.textContent = '\u2b07 PDF';
    dlPdfBtn.disabled = false;
  });
});

shareBtn.addEventListener('click', function() {
  var text = resultText.textContent;
  if (!text) return;
  shareBtn.textContent = '...';
  shareBtn.disabled = true;

  fetch('/api/v1/compose/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result_text: text, doc_type: intentToDocType(selectedIntent), intent: selectedIntent })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.url) {
      navigator.clipboard.writeText(data.url).catch(function(){});
      showToast('Share link copied to clipboard. Expires in 30 days.', 'ok');
    }
  })
  .catch(function() { showToast('Could not create share link.', 'err'); })
  .finally(function() {
    shareBtn.innerHTML = '&#128279; SHARE';
    shareBtn.disabled = false;
  });
});

function intentToDocType(intent) {
  var map = { apply: 'cover_letter', network: 'linkedin_note', follow_up: 'follow_up', referral: 'intro_email' };
  return map[intent] || '';
}

// ── Quota display ─────────────────────────────────────────────────────────────
function updateQuota() {
  if (quotaRemaining !== null) {
    quotaDisp.textContent = quotaRemaining + ' compose ops remaining today';
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
var toastTimer = null;
function showToast(msg, type) {
  toastEl.textContent = msg;
  toastEl.className = 'toast ' + (type || '');
  toastEl.style.display = 'block';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { toastEl.style.display = 'none'; }, 4000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderTemplateGrid();
</script>

</body>
</html>`;
}

// ── Chat index placeholder HTML ───────────────────────────────────────────────
function chatIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chat Interface — Axiom</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; color: #e5e5e5; font-family: 'Courier New', monospace; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
    .logo { font-size: 18px; font-weight: 700; letter-spacing: .14em; }
    .logo span { color: #7c3aed; }
    .msg { font-size: 13px; color: rgba(255,255,255,.4); max-width: 360px; text-align: center; line-height: 1.6; }
    a { display: inline-block; margin-top: 8px; padding: 10px 24px; background: #7c3aed; color: #fff; text-decoration: none; font-size: 12px; letter-spacing: .08em; border-radius: 6px; }
    a:hover { background: #6d28d9; }
  </style>
</head>
<body>
  <div class="logo">AXIOM<span>.SYS</span></div>
  <p class="msg">The conversational interface is coming soon. Use the Document Composer to tailor resumes, craft cover letters, and compose outreach today.</p>
  <a href="/api/demo/compose.html">Open Document Composer →</a>
</body>
</html>`;
}

// ── Routes ───────────────────────────────────────────────────────────────────
router.get("/demo/compose.html", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(composeDemoHtml());
});

router.get("/demo/index.html", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(chatIndexHtml());
});

export default router;
