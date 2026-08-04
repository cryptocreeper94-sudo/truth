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

    /* ── URL input mode ── */
    .doc-input-toggle { display: flex; gap: 2px; background: rgba(255,255,255,.05); border: 1px solid var(--border); border-radius: 5px; padding: 2px; }
    .doc-toggle-btn { padding: 4px 12px; font-size: 11px; font-family: monospace; border: none; background: transparent; color: var(--muted); cursor: pointer; border-radius: 3px; transition: all .15s; }
    .doc-toggle-btn.active { background: rgba(255,255,255,.12); color: var(--text); }
    .url-input-row { display: flex; gap: 8px; padding: 12px 16px 8px; }
    .url-input-row input { flex: 1; background: rgba(255,255,255,.06); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 13px; padding: 9px 12px; outline: none; transition: border-color .15s; font-family: inherit; }
    .url-input-row input::placeholder { color: var(--dim); }
    .url-input-row input:focus { border-color: var(--border-hi); }
    .url-input-row button { background: rgba(255,255,255,.08); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-family: monospace; font-size: 12px; cursor: pointer; padding: 0 16px; white-space: nowrap; transition: all .15s; }
    .url-input-row button:hover { border-color: var(--border-hi); background: rgba(255,255,255,.13); }
    .url-input-row button:disabled { opacity: .45; cursor: not-allowed; }
    .url-hint { padding: 0 16px 10px; font-size: 11px; color: var(--dim); font-family: monospace; }
    .url-hint.err { color: #fca5a5; }

    /* ── Draft banner ── */
    #draft-banner { display: none; background: var(--surface2); border: 1px solid var(--accent-hi); border-radius: 7px; padding: 10px 16px; margin-bottom: 20px; display: none; align-items: center; justify-content: space-between; gap: 12px; }
    .draft-banner-left { display: flex; align-items: center; gap: 10px; font-size: 12px; font-family: monospace; color: var(--muted); }
    .draft-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
    .draft-banner-text { color: var(--text); }
    .draft-clear-btn { background: transparent; border: 1px solid var(--border-hi); color: var(--muted); font-family: monospace; font-size: 11px; padding: 4px 12px; border-radius: 4px; cursor: pointer; transition: all .15s; white-space: nowrap; flex-shrink: 0; }
    .draft-clear-btn:hover { border-color: var(--red); color: #fca5a5; }

    /* ── Footer ── */
    footer { border-top: 1px solid var(--border); padding: 20px 24px; text-align: center; font-size: 11px; color: var(--dim); font-family: monospace; }

    /* ── Template Preview Modal ── */
    .tpl-preview-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.72); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity .2s; }
    .tpl-preview-backdrop.open { opacity: 1; pointer-events: auto; }
    .tpl-preview-modal { background: var(--surface); border: 1px solid var(--border-hi); border-radius: 12px; width: 100%; max-width: 680px; max-height: 88vh; display: flex; flex-direction: column; transform: translateY(12px); transition: transform .2s; overflow: hidden; }
    .tpl-preview-backdrop.open .tpl-preview-modal { transform: translateY(0); }
    .tpl-preview-head { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0; }
    .tpl-preview-meta { display: flex; align-items: center; gap: 12px; }
    .tpl-preview-icon { font-size: 26px; flex-shrink: 0; }
    .tpl-preview-info {}
    .tpl-preview-cat { font-size: 9px; font-family: monospace; letter-spacing: .14em; color: var(--accent); text-transform: uppercase; margin-bottom: 3px; }
    .tpl-preview-name { font-size: 15px; font-weight: 700; line-height: 1.2; }
    .tpl-preview-desc { font-size: 12px; color: var(--muted); margin-top: 3px; }
    .tpl-preview-close { background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 6px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; flex-shrink: 0; line-height: 1; transition: border-color .15s, color .15s; }
    .tpl-preview-close:hover { border-color: var(--border-hi); color: var(--text); }
    .tpl-preview-body { padding: 20px; overflow-y: auto; flex: 1; }
    .tpl-preview-code { white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.75; color: rgba(255,255,255,.75); background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
    .tpl-preview-foot { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; }
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
        <div class="doc-input-toggle">
          <button class="doc-toggle-btn active" id="doc-mode-text">PASTE TEXT</button>
          <button class="doc-toggle-btn" id="doc-mode-url">🔗 URL</button>
        </div>
      </div>
      <textarea id="doc-input" placeholder="Paste your resume or document here — or pick a template above to get started quickly."></textarea>
      <div id="doc-url-row" class="url-input-row" style="display:none">
        <input id="doc-url-input" type="url" placeholder="https://docs.google.com/… or a PDF URL" />
        <button id="doc-url-extract-btn">EXTRACT</button>
      </div>
      <div id="doc-url-hint" class="url-hint" style="display:none">Supports public Google Docs, PDFs, and most web pages.</div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">TARGET CONTEXT</span>
        <span class="panel-hint">Job description, company, or goal</span>
      </div>
      <textarea id="ctx-input" placeholder="Paste the job description or describe the role, company, and position you're targeting. The more context you give, the sharper the output."></textarea>
    </div>
  </div>

  <!-- ── Draft banner ── -->
  <div id="draft-banner">
    <div class="draft-banner-left">
      <div class="draft-dot"></div>
      <span class="draft-banner-text">Draft restored</span>
      <span>— your previous content has been loaded automatically.</span>
    </div>
    <button class="draft-clear-btn" id="draft-clear-btn">CLEAR DRAFT</button>
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

<!-- ── Template Preview Modal ── -->
<div class="tpl-preview-backdrop" id="tpl-preview-backdrop" role="dialog" aria-modal="true" aria-labelledby="tpl-preview-title">
  <div class="tpl-preview-modal">
    <div class="tpl-preview-head">
      <div class="tpl-preview-meta">
        <div class="tpl-preview-icon" id="tpl-preview-icon"></div>
        <div class="tpl-preview-info">
          <div class="tpl-preview-cat" id="tpl-preview-cat"></div>
          <div class="tpl-preview-name" id="tpl-preview-title"></div>
          <div class="tpl-preview-desc" id="tpl-preview-desc"></div>
        </div>
      </div>
      <button class="tpl-preview-close" id="tpl-preview-close" aria-label="Close preview">✕</button>
    </div>
    <div class="tpl-preview-body">
      <pre class="tpl-preview-code" id="tpl-preview-code"></pre>
    </div>
    <div class="tpl-preview-foot">
      <button class="btn btn-ghost" id="tpl-preview-cancel">CANCEL</button>
      <button class="btn btn-primary" id="tpl-preview-use">USE THIS TEMPLATE</button>
    </div>
  </div>
</div>

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
var docInput      = document.getElementById('doc-input');
var ctxInput      = document.getElementById('ctx-input');
var composeBtn    = document.getElementById('compose-btn');
var btnLabel      = document.getElementById('btn-label');
var clearBtn      = document.getElementById('clear-btn');
var resultSec     = document.getElementById('result-section');
var resultText    = document.getElementById('result-text');
var resultTitle   = document.getElementById('result-title');
var quotaDisp     = document.getElementById('quota-display');
var toastEl       = document.getElementById('toast');
var copyBtn       = document.getElementById('copy-btn');
var dlBtn         = document.getElementById('dl-btn');
var dlPdfBtn      = document.getElementById('dl-pdf-btn');
var shareBtn      = document.getElementById('share-btn');
var docModeText   = document.getElementById('doc-mode-text');
var docModeUrl    = document.getElementById('doc-mode-url');
var docUrlRow     = document.getElementById('doc-url-row');
var docUrlInput   = document.getElementById('doc-url-input');
var docUrlExtract = document.getElementById('doc-url-extract-btn');
var docUrlHint    = document.getElementById('doc-url-hint');

// ── Document URL extraction ───────────────────────────────────────────────────
docModeText.addEventListener('click', function() {
  docModeText.classList.add('active');
  docModeUrl.classList.remove('active');
  docInput.style.display = '';
  docUrlRow.style.display = 'none';
  docUrlHint.style.display = 'none';
});

docModeUrl.addEventListener('click', function() {
  docModeUrl.classList.add('active');
  docModeText.classList.remove('active');
  docInput.style.display = 'none';
  docUrlRow.style.display = 'flex';
  docUrlHint.style.display = 'block';
  docUrlHint.classList.remove('err');
  docUrlHint.textContent = 'Supports public Google Docs, PDFs, and most web pages.';
  docUrlInput.focus();
});

docUrlInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') extractDocFromUrl();
});

docUrlExtract.addEventListener('click', extractDocFromUrl);

function extractDocFromUrl() {
  var url = docUrlInput.value.trim();
  if (!url) return;
  docUrlExtract.disabled = true;
  docUrlExtract.textContent = '…';
  docUrlHint.classList.remove('err');
  docUrlHint.textContent = 'Fetching…';
  docUrlHint.style.display = 'block';

  fetch('/api/v1/compose/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url })
  })
  .then(function(res) {
    return res.json().then(function(body) {
      if (!res.ok) throw new Error(body.detail || body.error || ('Error ' + res.status));
      return body;
    });
  })
  .then(function(data) {
    docInput.value = data.text;
    // Switch back to text mode
    docModeText.classList.add('active');
    docModeUrl.classList.remove('active');
    docInput.style.display = '';
    docUrlRow.style.display = 'none';
    docUrlHint.style.display = 'none';
    docUrlInput.value = '';
    showToast('Resume extracted — review and execute.', 'ok');
    saveDraft();
  })
  .catch(function(err) {
    docUrlHint.classList.add('err');
    docUrlHint.textContent = err.message || 'Extraction failed.';
  })
  .finally(function() {
    docUrlExtract.disabled = false;
    docUrlExtract.textContent = 'EXTRACT';
  });
}

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
      openTemplatePreview(id);
    });
  });
}

// ── Template preview modal ────────────────────────────────────────────────────
var previewTemplateId = null;

function openTemplatePreview(id) {
  var tpl = TEMPLATES.find(function(t) { return t.id === id; });
  if (!tpl) return;
  previewTemplateId = id;

  document.getElementById('tpl-preview-icon').textContent  = tpl.icon;
  document.getElementById('tpl-preview-cat').textContent   = tpl.category;
  document.getElementById('tpl-preview-title').textContent = tpl.name;
  document.getElementById('tpl-preview-desc').textContent  = tpl.desc;
  document.getElementById('tpl-preview-code').textContent  = tpl.body;

  document.getElementById('tpl-preview-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTemplatePreview() {
  document.getElementById('tpl-preview-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  previewTemplateId = null;
}

document.getElementById('tpl-preview-close').addEventListener('click', closeTemplatePreview);
document.getElementById('tpl-preview-cancel').addEventListener('click', closeTemplatePreview);

// Close on backdrop click (outside the modal card)
document.getElementById('tpl-preview-backdrop').addEventListener('click', function(e) {
  if (e.target === this) closeTemplatePreview();
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeTemplatePreview();
});

document.getElementById('tpl-preview-use').addEventListener('click', function() {
  if (previewTemplateId) {
    closeTemplatePreview();
    applyTemplate(previewTemplateId);
  }
});

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
  scheduleSaveDraft();
}

// ── Draft persistence ─────────────────────────────────────────────────────────
var DRAFT_KEY = 'axiom_compose_draft';
var draftBanner = document.getElementById('draft-banner');
var draftClearBtn = document.getElementById('draft-clear-btn');
var draftSaveTimer = null;

function saveDraft() {
  try {
    var draft = {
      doc: docInput.value,
      ctx: ctxInput.value,
      intent: selectedIntent
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) { /* storage unavailable */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  draftBanner.style.display = 'none';
}

function scheduleSaveDraft() {
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(saveDraft, 600);
}

function loadDraft() {
  try {
    var raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    var draft = JSON.parse(raw);
    var hasContent = (draft.doc && draft.doc.trim()) || (draft.ctx && draft.ctx.trim());
    if (!hasContent) return;
    if (draft.doc) docInput.value = draft.doc;
    if (draft.ctx) ctxInput.value = draft.ctx;
    if (draft.intent) setIntent(draft.intent);
    draftBanner.style.display = 'flex';
  } catch (e) { /* ignore corrupt data */ }
}

docInput.addEventListener('input', scheduleSaveDraft);
ctxInput.addEventListener('input', scheduleSaveDraft);

// Flush draft synchronously when the page is hidden (refresh, tab close, navigation)
window.addEventListener('pagehide', saveDraft);
window.addEventListener('beforeunload', saveDraft);

draftClearBtn.addEventListener('click', function() {
  clearDraft();
  docInput.value = '';
  ctxInput.value = '';
  document.querySelectorAll('.tpl-card').forEach(function(c) { c.classList.remove('active'); });
  activeTemplateId = null;
});

// ── Clear ─────────────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', function() {
  docInput.value = '';
  ctxInput.value = '';
  resultSec.style.display = 'none';
  document.querySelectorAll('.tpl-card').forEach(function(c) { c.classList.remove('active'); });
  activeTemplateId = null;
  clearDraft();
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
loadDraft();
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

// ── Image Generation demo HTML ────────────────────────────────────────────────
function imageGenDemoHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Image Generation — Axiom</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0a; --surface: #111; --surface2: #161616; --border: rgba(255,255,255,.08);
      --border-hi: rgba(255,255,255,.18); --text: #e5e5e5; --muted: rgba(255,255,255,.4);
      --dim: rgba(255,255,255,.22); --accent: #7c3aed; --accent-lo: rgba(124,58,237,.15);
      --accent-hi: rgba(124,58,237,.35); --green: #22c55e; --red: #ef4444;
      --cyan: #22d3ee; --cyan-lo: rgba(34,211,238,.12);
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
    .nav-link { font-size: 12px; color: var(--muted); text-decoration: none; font-family: monospace; letter-spacing: .06em; }
    .nav-link:hover { color: var(--text); }

    /* ── Layout ── */
    .page { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }

    /* ── Section label ── */
    .section-label { font-family: monospace; font-size: 10px; letter-spacing: .16em; color: var(--cyan); text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .section-label::before { content: ''; display: block; width: 3px; height: 3px; background: var(--cyan); border-radius: 50%; }

    /* ── Page title ── */
    .page-title { font-size: 28px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 6px; }
    .page-sub { font-size: 14px; color: var(--muted); margin-bottom: 40px; font-family: monospace; }

    /* ── Prompt form ── */
    .prompt-form { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px; margin-bottom: 32px; }
    .prompt-label { font-family: monospace; font-size: 11px; letter-spacing: .12em; color: var(--muted); text-transform: uppercase; margin-bottom: 10px; display: block; }
    textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; padding: 14px 16px; resize: vertical; min-height: 100px; outline: none; transition: border-color .15s; font-family: inherit; line-height: 1.6; }
    textarea:focus { border-color: var(--cyan); }
    textarea::placeholder { color: var(--muted); }

    /* ── Size selector ── */
    .size-row { display: flex; gap: 10px; margin: 20px 0 24px; flex-wrap: wrap; }
    .size-btn { flex: 1; min-width: 80px; padding: 10px 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--muted); font-family: monospace; font-size: 11px; letter-spacing: .08em; cursor: pointer; transition: all .15s; text-align: center; }
    .size-btn:hover { border-color: var(--border-hi); color: var(--text); }
    .size-btn.active { border-color: var(--cyan); color: var(--cyan); background: var(--cyan-lo); }

    /* ── Generate button ── */
    .generate-btn { width: 100%; padding: 14px; background: var(--accent); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; font-family: monospace; letter-spacing: .08em; cursor: pointer; transition: background .15s, opacity .15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .generate-btn:hover:not(:disabled) { background: #6d28d9; }
    .generate-btn:disabled { opacity: .5; cursor: not-allowed; }

    /* ── Quota bar ── */
    .quota-row { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
    .quota-label { font-family: monospace; font-size: 11px; color: var(--muted); }
    .quota-pips { display: flex; gap: 4px; }
    .quota-pip { width: 18px; height: 6px; border-radius: 3px; background: var(--surface2); border: 1px solid var(--border); transition: background .3s; }
    .quota-pip.used { background: var(--accent); border-color: var(--accent-hi); }

    /* ── Result area ── */
    #result-area { margin-bottom: 48px; }
    .result-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .result-header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; justify-between; align-items: center; font-family: monospace; font-size: 11px; color: var(--muted); letter-spacing: .1em; }
    .result-header span { display: flex; align-items: center; gap: 8px; }
    .result-img-wrap { padding: 24px; display: flex; justify-content: center; }
    .result-img-wrap img { max-width: 100%; border-radius: 8px; display: block; }
    .result-actions { padding: 0 24px 20px; display: flex; gap: 10px; }
    .action-btn { padding: 8px 18px; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 12px; font-family: monospace; cursor: pointer; transition: border-color .15s; text-decoration: none; }
    .action-btn:hover { border-color: var(--border-hi); }

    /* ── Generating spinner ── */
    .spinner-wrap { padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--muted); font-family: monospace; font-size: 12px; letter-spacing: .1em; }
    .spinner { width: 32px; height: 32px; border: 2px solid var(--border); border-top-color: var(--cyan); border-radius: 50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Error state ── */
    .error-msg { padding: 16px 20px; background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.2); border-radius: 8px; color: #fca5a5; font-family: monospace; font-size: 13px; margin-bottom: 20px; line-height: 1.5; }

    /* ── History ── */
    #history-section { }
    .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .history-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: border-color .15s; }
    .history-card:hover { border-color: var(--border-hi); }
    .history-card img { width: 100%; display: block; aspect-ratio: 1; object-fit: cover; }
    .history-card-body { padding: 12px; }
    .history-card-prompt { font-size: 12px; color: var(--muted); line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .history-card-meta { font-family: monospace; font-size: 10px; color: var(--dim); margin-top: 6px; letter-spacing: .06em; }
    .empty-history { font-family: monospace; font-size: 12px; color: var(--muted); padding: 24px 0; letter-spacing: .06em; }
  </style>
</head>
<body>
  <header>
    <div class="logo">AXIOM<span>.SYS</span></div>
    <div class="header-right">
      <a href="/" class="nav-link">HOME</a>
      <a href="/api/demo/compose.html" class="nav-link">COMPOSE</a>
      <a href="/api/demo/index.html" class="nav-link">CHAT</a>
      <div class="status-pill"><span class="status-dot"></span>ONLINE</div>
    </div>
  </header>

  <div class="page">
    <div class="section-label">Image Generation</div>
    <div class="page-title">Generate Visuals</div>
    <p class="page-sub">Create professional imagery on demand. 5 free generations per day.</p>

    <div class="prompt-form" id="prompt-form">
      <label class="prompt-label" for="prompt-input">Describe your image</label>
      <textarea id="prompt-input" placeholder="A photorealistic executive headshot with soft studio lighting, neutral gray background, professional attire…" rows="4"></textarea>

      <div class="size-row">
        <button class="size-btn active" data-size="square">■ Square<br><span style="font-size:9px;opacity:.6">1024×1024</span></button>
        <button class="size-btn" data-size="wide">▬ Wide<br><span style="font-size:9px;opacity:.6">1536×1024</span></button>
        <button class="size-btn" data-size="tall">▮ Tall<br><span style="font-size:9px;opacity:.6">1024×1536</span></button>
      </div>

      <button class="generate-btn" id="generate-btn">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
        GENERATE IMAGE
      </button>

      <div class="quota-row" id="quota-row" style="display:none">
        <span class="quota-label" id="quota-label">— / 5 used today</span>
        <div class="quota-pips" id="quota-pips">
          <div class="quota-pip"></div><div class="quota-pip"></div><div class="quota-pip"></div><div class="quota-pip"></div><div class="quota-pip"></div>
        </div>
      </div>
    </div>

    <div id="error-area"></div>
    <div id="result-area"></div>

    <div id="history-section">
      <div class="section-label">Generation History</div>
      <div class="history-grid" id="history-grid">
        <div class="empty-history">Loading history…</div>
      </div>
    </div>
  </div>

  <script>
    let selectedSize = 'square';
    let isGenerating = false;

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
      });
    });

    // Update quota display
    function updateQuota(used, limit) {
      const row = document.getElementById('quota-row');
      const label = document.getElementById('quota-label');
      const pips = document.getElementById('quota-pips');
      row.style.display = 'flex';
      label.textContent = used + ' / ' + limit + ' used today';
      pips.querySelectorAll('.quota-pip').forEach((pip, i) => {
        pip.classList.toggle('used', i < used);
      });
    }

    // Show error
    function showError(msg) {
      const area = document.getElementById('error-area');
      area.innerHTML = '<div class="error-msg">' + msg.replace(/</g,'&lt;') + '</div>';
    }
    function clearError() {
      document.getElementById('error-area').innerHTML = '';
    }

    // Generate
    document.getElementById('generate-btn').addEventListener('click', async () => {
      const prompt = document.getElementById('prompt-input').value.trim();
      if (!prompt) { showError('Please enter a prompt to generate an image.'); return; }
      if (isGenerating) return;

      isGenerating = true;
      clearError();
      const btn = document.getElementById('generate-btn');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> GENERATING…';

      const resultArea = document.getElementById('result-area');
      resultArea.innerHTML = '<div class="result-panel"><div class="spinner-wrap"><div class="spinner"></div>SYNTHESIZING IMAGE…</div></div>';

      try {
        const res = await fetch('/api/v1/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, size: selectedSize })
        });
        const data = await res.json();

        if (!res.ok) {
          resultArea.innerHTML = '';
          showError((data.detail || data.error || 'Generation failed. Please try again.'));
          if (data.remaining !== undefined) updateQuota(data.used ?? 5, 5);
        } else {
          updateQuota(data.used, data.limit);
          const imgSrc = 'data:image/png;base64,' + data.b64_json;
          resultArea.innerHTML = \`
            <div class="result-panel" style="margin-bottom:32px">
              <div class="result-header">
                <span>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 15l-5-5L5 21"/></svg>
                  GENERATED · \${selectedSize.toUpperCase()}
                </span>
                <span style="color:var(--green)">COMPLETE</span>
              </div>
              <div class="result-img-wrap"><img src="\${imgSrc}" alt="Generated image" /></div>
              <div class="result-actions">
                <a class="action-btn" href="\${imgSrc}" download="axiom-image.png">↓ DOWNLOAD</a>
              </div>
            </div>\`;
          loadHistory();
        }
      } catch (err) {
        resultArea.innerHTML = '';
        showError('Network error. Please check your connection and try again.');
      } finally {
        isGenerating = false;
        btn.disabled = false;
        btn.innerHTML = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg> GENERATE IMAGE';
      }
    });

    // Load history
    async function loadHistory() {
      const grid = document.getElementById('history-grid');
      try {
        const res = await fetch('/api/v1/image/history');
        const data = await res.json();
        if (!data.images || data.images.length === 0) {
          grid.innerHTML = '<div class="empty-history">No images generated yet. Your history will appear here.</div>';
          return;
        }
        grid.innerHTML = data.images.map(img => {
          const src = 'data:image/png;base64,' + img.image_data_b64;
          const date = new Date(img.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          return \`
            <div class="history-card">
              <img src="\${src}" alt="\${img.prompt}" loading="lazy" />
              <div class="history-card-body">
                <div class="history-card-prompt">\${img.prompt.replace(/</g,'&lt;')}</div>
                <div class="history-card-meta">\${img.size.toUpperCase()} · \${date}</div>
              </div>
            </div>\`;
        }).join('');
      } catch {
        grid.innerHTML = '<div class="empty-history">Could not load history.</div>';
      }
    }

    loadHistory();
  </script>
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

router.get("/demo/image.html", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(imageGenDemoHtml());
});

export default router;
