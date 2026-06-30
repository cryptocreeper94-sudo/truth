# Study Fix — Deploy Instructions

## Root Cause
Helmet (the server security middleware) sends this header on every response:

    Content-Security-Policy: script-src 'self'

This means the browser blocks ALL inline `<script>` blocks — silently, no visible error.
Every single page in the study had its JavaScript living in an inline script block,
so none of it ever ran. Checkboxes did nothing. Timer never started. Survey never built itself.

## The Fix
All JavaScript has been moved out of inline script blocks and into `app.js`.
Each page's logic is wrapped in a guard so it only runs on the right page.

## What to copy into your repo

Copy these 7 files into `study/public/` in the `cryptocreeper94-sudo/lume` repo,
replacing the existing versions:

    study-fix/app.js          → study/public/app.js
    study-fix/index.html      → study/public/index.html
    study-fix/task.html       → study/public/task.html
    study-fix/survey.html     → study/public/survey.html
    study-fix/done.html       → study/public/done.html
    study-fix/admin.html      → study/public/admin.html
    study-fix/orientation.html → study/public/orientation.html

style.css does NOT need to change.

## After deploying
Render auto-deploys on push to main. Once the deploy completes (~2 min),
visit study.tlid.io and the checkboxes will work immediately.
