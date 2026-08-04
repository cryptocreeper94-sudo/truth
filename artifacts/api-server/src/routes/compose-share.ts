import { Router, type Request, type Response } from "express";
import { db, axiomComposeSharesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ── slug generation ────────────────────────────────────────────────────────
// Use crypto.getRandomValues (Web Crypto, available in Node 15+) for a
// cryptographically secure base62 slug.
const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LENGTH = 10;

function generateSlug(): string {
  const bytes = new Uint8Array(SLUG_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => BASE62[b % BASE62.length])
    .join("");
}

// ── share URL helpers ──────────────────────────────────────────────────────
function buildShareUrl(req: Request, slug: string): string {
  // Prefer an explicit env override; fall back to request origin.
  if (process.env.SHARE_BASE_URL) {
    return `${process.env.SHARE_BASE_URL}/${slug}`;
  }
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? req.protocol;
  const host = req.headers["x-forwarded-host"] as string | undefined ?? req.get("host") ?? "localhost";
  // Share viewer is served from the API server at /api/compose/share/:slug
  return `${proto}://${host}/api/compose/share/${slug}`;
}

// ── share viewer HTML ──────────────────────────────────────────────────────
function shareViewerHtml(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shared Document — Axiom</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, sans-serif; min-height: 100vh;
    }
    header {
      border-bottom: 1px solid rgba(255,255,255,.08); padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { font-size: 17px; font-weight: 600; letter-spacing: -.3px; }
    .badge {
      font-size: 11px; color: rgba(255,255,255,.45); border: 1px solid rgba(255,255,255,.18);
      border-radius: 6px; padding: 2px 8px; margin-left: 10px;
    }
    .nav-link { font-size: 12px; color: rgba(255,255,255,.4); text-decoration: none; }
    .nav-link:hover { color: rgba(255,255,255,.7); }
    main { max-width: 680px; margin: 0 auto; padding: 40px 24px; }
    .meta { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .meta-row { font-size: 12px; color: rgba(255,255,255,.38); display: flex; gap: 12px; align-items: center; }
    .actions { display: flex; gap: 8px; flex-shrink: 0; }
    button {
      height: 32px; padding: 0 12px; border-radius: 8px; border: none; cursor: pointer;
      font-size: 12px; display: inline-flex; align-items: center; gap: 6px; transition: background .15s;
    }
    .btn-ghost {
      background: transparent; color: rgba(255,255,255,.55); border: 1px solid rgba(255,255,255,.1);
    }
    .btn-ghost:hover { background: rgba(255,255,255,.07); color: #fff; }
    .doc-body {
      border: 1px solid rgba(255,255,255,.08); border-radius: 12px;
      background: rgba(255,255,255,.025); padding: 28px;
    }
    pre { white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,.78); font-family: inherit; }
    footer { text-align: center; font-size: 11px; color: rgba(255,255,255,.22); margin-top: 28px; }
    footer a { color: rgba(255,255,255,.35); text-decoration: none; }
    footer a:hover { color: rgba(255,255,255,.6); }
    /* states */
    .state-center {
      min-height: 80vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 16px; text-align: center;
    }
    .state-icon { font-size: 40px; }
    .state-title { font-size: 20px; font-weight: 600; }
    .state-body { font-size: 14px; color: rgba(255,255,255,.4); max-width: 280px; line-height: 1.5; }
    .state-link { font-size: 13px; color: rgba(255,255,255,.45); text-decoration: underline; text-underline-offset: 3px; }
    .state-link:hover { color: rgba(255,255,255,.7); }
    #spinner { animation: spin 1s linear infinite; display: inline-block; font-size: 28px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const SLUG = ${JSON.stringify(slug)};
    const app = document.getElementById('app');

    function render(html) { app.innerHTML = html; }

    function loading() {
      render(\`<div class="state-center"><div id="spinner">⟳</div></div>\`);
    }

    function notFound() {
      render(\`
        <div class="state-center">
          <div class="state-icon">🔍</div>
          <div class="state-title">Link not found</div>
          <div class="state-body">This share link doesn't exist. It may have been removed or the URL is incorrect.</div>
          <a class="state-link" href="/">Go to Axiom →</a>
        </div>
      \`);
    }

    function expired() {
      render(\`
        <div class="state-center">
          <div class="state-icon">⏰</div>
          <div class="state-title">Link expired</div>
          <div class="state-body">This share link has expired. Axiom share links are valid for 30 days.</div>
          <a class="state-link" href="/">Compose a new document →</a>
        </div>
      \`);
    }

    function errored(msg) {
      render(\`
        <div class="state-center">
          <div class="state-icon">⚠️</div>
          <div class="state-title">Something went wrong</div>
          <div class="state-body">\${msg || 'We couldn\\'t load this document. Please try again later.'}</div>
        </div>
      \`);
    }

    const DOC_LABELS = {
      cover_letter: 'Cover Letter', linkedin_note: 'LinkedIn Note',
      follow_up: 'Follow-up Email', intro_email: 'Intro Email'
    };

    function escHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function fmtDate(iso) {
      return escHtml(new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }));
    }

    function loaded(share) {
      const label = escHtml(DOC_LABELS[share.doc_type] || share.doc_type);
      render(\`
        <header>
          <div style="display:flex;align-items:center">
            <span class="logo">Axiom</span>
            <span class="badge">Shared document</span>
          </div>
          <a class="nav-link" href="/">Try Axiom →</a>
        </header>
        <main>
          <div class="meta">
            <div>
              <h1>\${label}</h1>
              <div class="meta-row">
                <span>📄 \${label}</span>
                <span style="color:rgba(255,255,255,.15)">·</span>
                <span>⏰ Expires \${fmtDate(share.expires_at)}</span>
              </div>
            </div>
            <div class="actions">
              <button class="btn-ghost" id="btn-copy">📋 Copy</button>
              <button class="btn-ghost" id="btn-dl">⬇ Download</button>
            </div>
          </div>
          <div class="doc-body"><pre id="doc-text"></pre></div>
          <footer>
            Created with <a href="/">Axiom</a> on \${fmtDate(share.created_at)}
          </footer>
        </main>
      \`);
      document.getElementById('doc-text').textContent = share.result_text;

      document.getElementById('btn-copy').addEventListener('click', async () => {
        await navigator.clipboard.writeText(share.result_text);
        const btn = document.getElementById('btn-copy');
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.innerHTML = '📋 Copy'; }, 2000);
      });

      document.getElementById('btn-dl').addEventListener('click', () => {
        const blob = new Blob([share.result_text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'axiom-' + share.doc_type + '.txt'; a.click();
        URL.revokeObjectURL(url);
      });
    }

    async function init() {
      loading();
      try {
        const res = await fetch('/api/v1/compose/share/' + encodeURIComponent(SLUG));
        if (res.status === 404) { notFound(); return; }
        if (res.status === 410) { expired(); return; }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || ('Server error ' + res.status));
        }
        loaded(await res.json());
      } catch(e) {
        errored(e.message);
      }
    }

    init();
  </script>
</body>
</html>`;
}

// ── validation ─────────────────────────────────────────────────────────────
const ALLOWED_DOC_TYPES = [
  "cover_letter",
  "linkedin_note",
  "follow_up",
  "intro_email",
  "",
] as const;

const ALLOWED_INTENTS = [
  "apply",
  "follow_up",
  "network",
  "referral",
  "",
] as const;

const createShareSchema = z.object({
  result_text: z.string().min(1, "result_text is required"),
  doc_type: z
    .enum(ALLOWED_DOC_TYPES)
    .optional()
    .default(""),
  intent: z
    .enum(ALLOWED_INTENTS)
    .optional()
    .default(""),
});

const SHARE_TTL_DAYS = 30;

// ── POST /v1/compose/share ─────────────────────────────────────────────────
router.post("/v1/compose/share", async (req: Request, res: Response) => {
  const parsed = createShareSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { result_text, doc_type, intent } = parsed.data;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SHARE_TTL_DAYS);

  // Generate a unique slug — retry up to 3 times on collision
  let slug = generateSlug();
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await db
      .select({ id: axiomComposeSharesTable.id })
      .from(axiomComposeSharesTable)
      .where(eq(axiomComposeSharesTable.slug, slug))
      .limit(1);
    if (existing.length === 0) break;
    slug = generateSlug();
  }

  const id = crypto.randomUUID();

  try {
    await db.insert(axiomComposeSharesTable).values({
      id,
      slug,
      result_text,
      doc_type: doc_type ?? "",
      intent: intent ?? "",
      expires_at: expiresAt,
    });
  } catch (err) {
    console.error("Failed to insert compose share:", err);
    res.status(500).json({ error: "Failed to create share" });
    return;
  }

  const url = buildShareUrl(req, slug);

  res.status(201).json({ slug, url, expires_at: expiresAt.toISOString() });
});

// ── GET /v1/compose/share/:slug  (JSON API) ────────────────────────────────
router.get("/v1/compose/share/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params["slug"] ?? "");

  if (!slug || !/^[A-Za-z0-9]{1,32}$/.test(slug)) {
    res.status(400).json({ error: "Invalid slug" });
    return;
  }

  let rows: (typeof axiomComposeSharesTable.$inferSelect)[];
  try {
    rows = await db
      .select()
      .from(axiomComposeSharesTable)
      .where(eq(axiomComposeSharesTable.slug, slug))
      .limit(1);
  } catch (err) {
    console.error("Failed to fetch compose share:", err);
    res.status(500).json({ error: "Failed to retrieve share" });
    return;
  }

  if (rows.length === 0) {
    res.status(404).json({ error: "Share not found" });
    return;
  }

  const share = rows[0];

  if (new Date(share.expires_at) < new Date()) {
    res.status(410).json({ error: "This share link has expired" });
    return;
  }

  res.json({
    slug: share.slug,
    result_text: share.result_text,
    doc_type: share.doc_type,
    intent: share.intent,
    created_at: share.created_at,
    expires_at: share.expires_at,
  });
});

// ── GET /compose/share/:slug  (HTML viewer) ────────────────────────────────
// Served at /api/compose/share/:slug through the Replit proxy.
router.get("/compose/share/:slug", (req: Request, res: Response) => {
  const slug = String(req.params["slug"] ?? "");

  if (!slug || !/^[A-Za-z0-9]{1,32}$/.test(slug)) {
    res.status(400).send("Invalid slug");
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(shareViewerHtml(slug));
});

export default router;
