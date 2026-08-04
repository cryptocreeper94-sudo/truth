import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, Clock, FileText, Loader2 } from "lucide-react";

const DOC_TYPE_LABELS: Record<string, string> = {
  cover_letter: "Cover Letter",
  linkedin_note: "LinkedIn Note",
  follow_up: "Follow-up Email",
  intro_email: "Intro Email",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ShareData {
  slug: string;
  result_text: string;
  doc_type: string;
  intent: string;
  created_at: string;
  expires_at: string;
}

type LoadState = "loading" | "loaded" | "not_found" | "expired" | "error";
type CopyState = "idle" | "copied";

/** Extract slug from ?slug=XXXX query param, or fall back to the last path segment. */
function getSlugFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("slug");
  if (fromQuery) return fromQuery;
  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? null;
}

export default function ComposeShare() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [share, setShare] = useState<ShareData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    const slug = getSlugFromUrl();
    if (!slug || slug === "compose-share") {
      // No slug in URL — show a demo document for mockup purposes
      setShare({
        slug: "demo",
        result_text: `Dear Hiring Manager,

I'm writing to express my strong interest in the Senior Product Designer role at Axiom. With seven years of experience crafting end-to-end user experiences for B2B SaaS products, I bring a deep understanding of both the craft and the strategic thinking that high-impact design demands.

At my current role at Vercel, I led the redesign of our deployment dashboard — reducing time-to-first-deploy by 38% and receiving the highest satisfaction scores in the product's history. I thrive in environments where design, engineering, and product strategy are tightly coupled, and I'm drawn to Axiom's commitment to deterministic, composable tooling.

I'd love to bring that same rigor to your team.

Best regards,
Jordan Ellis`,
        doc_type: "cover_letter",
        intent: "apply",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setLoadState("loaded");
      return;
    }

    void (async () => {
      try {
        const res = await fetch(`/api/v1/compose/share/${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          setLoadState("not_found");
          return;
        }
        if (res.status === 410) {
          setLoadState("expired");
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Server error ${res.status}`);
        }
        const data = (await res.json()) as ShareData;
        setShare(data);
        setLoadState("loaded");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMsg(message);
        setLoadState("error");
      }
    })();
  }, []);

  async function handleCopy() {
    if (!share) return;
    await navigator.clipboard.writeText(share.result_text);
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  function handleDownload() {
    if (!share) return;
    const blob = new Blob([share.result_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-${share.doc_type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── loading ───────────────────────────────────────────────────────────────
  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  // ── not found ─────────────────────────────────────────────────────────────
  if (loadState === "not_found") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl">🔍</span>
        <h1 className="text-xl font-semibold">Link not found</h1>
        <p className="text-white/40 text-sm max-w-xs">
          This share link doesn't exist. It may have been removed or the URL is
          incorrect.
        </p>
        <a
          href="/"
          className="mt-2 text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4"
        >
          Go to Axiom →
        </a>
      </div>
    );
  }

  // ── expired ───────────────────────────────────────────────────────────────
  if (loadState === "expired") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl">⏰</span>
        <h1 className="text-xl font-semibold">Link expired</h1>
        <p className="text-white/40 text-sm max-w-xs">
          This share link has expired. Axiom share links are valid for 30 days.
        </p>
        <a
          href="/"
          className="mt-2 text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4"
        >
          Compose a new document →
        </a>
      </div>
    );
  }

  // ── error ─────────────────────────────────────────────────────────────────
  if (loadState === "error" || !share) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-white/40 text-sm max-w-xs">
          {errorMsg || "We couldn't load this document. Please try again later."}
        </p>
      </div>
    );
  }

  const docTypeLabel = DOC_TYPE_LABELS[share.doc_type] ?? share.doc_type;

  // ── loaded ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* ── nav ── */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">Axiom</span>
          <Badge
            variant="outline"
            className="text-xs border-white/20 text-white/50"
          >
            Shared document
          </Badge>
        </div>
        <a
          href="/"
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Try Axiom →
        </a>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* ── meta row ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {docTypeLabel}
            </h1>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {docTypeLabel}
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Expires {formatDate(share.expires_at)}
              </span>
            </div>
          </div>

          {/* ── action row ── */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-xs">Download</span>
            </Button>
          </div>
        </div>

        {/* ── document body ── */}
        <div className="rounded-xl border border-white/8 bg-white/3 p-7">
          <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans">
            {share.result_text}
          </pre>
        </div>

        {/* ── footer attribution ── */}
        <p className="text-center text-xs text-white/25 pt-2">
          Created with{" "}
          <a
            href="/"
            className="text-white/40 hover:text-white/60 transition-colors"
          >
            Axiom
          </a>{" "}
          on {formatDate(share.created_at)}
        </p>
      </main>
    </div>
  );
}
