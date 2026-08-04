import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Download, Share2, Check, Loader2, Sparkles } from "lucide-react";

// ── sample composed output ──────────────────────────────────────────────────
const SAMPLE_COVER_LETTER = `Dear Hiring Manager,

I'm writing to express my strong interest in the Senior Product Designer role at Axiom. With seven years of experience crafting end-to-end user experiences for B2B SaaS products, I bring a deep understanding of both the craft and the strategic thinking that high-impact design demands.

At my current role at Vercel, I led the redesign of our deployment dashboard — reducing time-to-first-deploy by 38% and receiving the highest satisfaction scores in the product's history. I thrive in environments where design, engineering, and product strategy are tightly coupled, and I'm drawn to Axiom's commitment to deterministic, composable tooling.

I'd love to bring that same rigor to your team.

Best regards,
Jordan Ellis`;

type ComposeState = "idle" | "composing" | "done";
type CopyState = "idle" | "copied";
type ShareState = "idle" | "sharing" | "done" | "error";

export default function Compose() {
  const [jobDescription, setJobDescription] = useState(
    "Senior Product Designer at Axiom — 5+ yrs B2B SaaS, Figma, systems thinking, cross-functional collaboration.",
  );
  const [docType, setDocType] = useState("cover_letter");
  const [intent, setIntent] = useState("apply");
  const [composeState, setComposeState] = useState<ComposeState>("idle");
  const [resultText, setResultText] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [shareUrl, setShareUrl] = useState("");
  const [shareError, setShareError] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── simulate compose ──────────────────────────────────────────────────────
  function handleCompose() {
    setComposeState("composing");
    setResultText("");
    setShareState("idle");
    setShareUrl("");
    setShareError("");
    setTimeout(() => {
      setResultText(SAMPLE_COVER_LETTER);
      setComposeState("done");
    }, 1800);
  }

  // ── copy result text ──────────────────────────────────────────────────────
  async function handleCopy() {
    await navigator.clipboard.writeText(resultText);
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  // ── download as .txt ──────────────────────────────────────────────────────
  function handleDownload() {
    const blob = new Blob([resultText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-${docType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── share — calls POST /api/v1/compose/share ──────────────────────────────
  async function handleShare() {
    setShareState("sharing");
    setShareError("");
    setDialogOpen(true);
    try {
      const res = await fetch("/api/v1/compose/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_text: resultText, doc_type: docType, intent }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const data = (await res.json()) as { url: string; slug: string; expires_at: string };
      setShareUrl(data.url);
      setShareState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setShareError(message);
      setShareState("error");
    }
  }

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }

  const hasResult = composeState === "done" && resultText.length > 0;

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
            Compose
          </Badge>
        </div>
        <div className="text-xs text-white/30">Jordan Ellis</div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* ── form ── */}
        <section className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Document type
            </label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="cover_letter">Cover Letter</SelectItem>
                <SelectItem value="linkedin_note">LinkedIn Note</SelectItem>
                <SelectItem value="follow_up">Follow-up Email</SelectItem>
                <SelectItem value="intro_email">Intro Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Intent
            </label>
            <Select value={intent} onValueChange={setIntent}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="apply">Apply for role</SelectItem>
                <SelectItem value="follow_up">Follow up after interview</SelectItem>
                <SelectItem value="network">Network / introduction</SelectItem>
                <SelectItem value="referral">Request referral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Job / context
            </label>
            <Textarea
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none min-h-[100px] focus-visible:ring-1 focus-visible:ring-white/20"
              placeholder="Paste a job description or describe the opportunity…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCompose}
            disabled={composeState === "composing" || !jobDescription.trim()}
            className="w-full h-11 bg-white text-black font-medium hover:bg-white/90 disabled:opacity-40"
          >
            {composeState === "composing" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Composing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Compose
              </>
            )}
          </Button>
        </section>

        {/* ── result ── */}
        {(composeState === "composing" || hasResult) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Result
              </span>
              {hasResult && (
                <div className="flex items-center gap-2">
                  {/* Copy */}
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

                  {/* Download */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-xs">Download</span>
                  </Button>

                  {/* Share */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    disabled={shareState === "sharing"}
                    className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5 disabled:opacity-40"
                  >
                    {shareState === "sharing" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs">Sharing…</span>
                      </>
                    ) : shareState === "done" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs">Shared</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="text-xs">Share</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {composeState === "composing" && !resultText && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-3">
                {[80, 60, 90, 55, 70].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 rounded-full bg-white/8 animate-pulse"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            )}

            {resultText && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-6">
                <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans">
                  {resultText}
                </pre>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── share dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#161616] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              {shareState === "sharing"
                ? "Creating share link…"
                : shareState === "done"
                  ? "Link ready"
                  : "Share failed"}
            </DialogTitle>
          </DialogHeader>

          {shareState === "sharing" && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          )}

          {shareState === "done" && shareUrl && (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-white/50">
                Anyone with this link can view the document. It expires in 30
                days.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 truncate font-mono">
                  {shareUrl}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0 h-8 px-3 bg-white text-black hover:bg-white/90 text-xs"
                >
                  {urlCopied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    "Copy link"
                  )}
                </Button>
              </div>
            </div>
          )}

          {shareState === "error" && (
            <p className="text-sm text-red-400 pt-1">
              {shareError || "Something went wrong. Please try again."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
