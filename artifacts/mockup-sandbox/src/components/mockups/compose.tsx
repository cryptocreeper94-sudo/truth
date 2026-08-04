import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { Copy, Download, Share2, Check, Loader2, Sparkles, ImagePlus, ArrowUpCircle, Target } from "lucide-react";

// ── sample composed output ──────────────────────────────────────────────────
const SAMPLE_COVER_LETTER = `Dear Hiring Manager,

I'm writing to express my strong interest in the Senior Product Designer role at Axiom. With seven years of experience crafting end-to-end user experiences for B2B SaaS products, I bring a deep understanding of both the craft and the strategic thinking that high-impact design demands.

At my current role at Vercel, I led the redesign of our deployment dashboard — reducing time-to-first-deploy by 38% and receiving the highest satisfaction scores in the product's history. I thrive in environments where design, engineering, and product strategy are tightly coupled, and I'm drawn to Axiom's commitment to deterministic, composable tooling.

I'd love to bring that same rigor to your team.

Best regards,
Jordan Ellis`;

const SAMPLE_RESUME = `Jordan Ellis — Product Designer
jordan@example.com · linkedin.com/in/jordanellis

EXPERIENCE

Senior Product Designer — Vercel (2021–present)
• Led redesign of the deployment dashboard, reducing time-to-first-deploy by 38%
• Collaborated with engineering and PM to ship the new Deployments v2 product
• Worked across functions to align on design direction with leadership

Product Designer — Stripe (2019–2021)
• Designed onboarding flows for Stripe Checkout used by 200k+ merchants
• Partnered with cross-functional teams to deliver the Radar fraud-detection UI

SKILLS
Figma, user testing, interaction design, B2B SaaS, design critique, prototyping

EDUCATION
BFA Graphic Design — RISD, 2019`;

// ── ATS keyword extraction from job description text ────────────────────────
// Extracts significant unigrams and bigrams from the JD, filtering stop words,
// then checks which appear in the resume.  No hardcoded keyword list.
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","as",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","not","no",
  "nor","so","yet","both","either","neither","each","many","much","few","more",
  "most","other","another","such","what","which","who","this","that","these",
  "those","we","us","our","you","your","they","their","he","she","it","his",
  "her","its","my","i","me","am","from","by","about","into","through","before",
  "after","above","below","between","up","down","out","off","over","under",
  "again","then","when","where","why","how","all","any","some","only","same",
  "than","very","just","also","including","vs","per","e","g","etc","role","job",
  "work","team","strong","ability","experience","years","yrs","plus","must",
  "ideal","key","looking","seek","seeking","join","help","build","good",
  "great","excellent","outstanding","passionate","proven","demonstrated",
]);

function extractKeywordsFromJd(jd: string): string[] {
  const lower = jd.toLowerCase();
  const tokens = lower
    .split(/[\s,;:.!?()\[\]{}'"""''\u2013\u2014\-\/\+]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  // Bigrams first (more specific, e.g. "design systems")
  const bigrams: string[] = [];
  const rawTokens = lower
    .split(/[\s,;:.!?()\[\]{}'"""''\u2013\u2014\-\/\+]+/)
    .map((w) => w.replace(/[^a-z0-9 ]/g, "").trim())
    .filter(Boolean);
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const a = rawTokens[i]!;
    const b = rawTokens[i + 1]!;
    if (!STOP_WORDS.has(a) && !STOP_WORDS.has(b) && a.length >= 3 && b.length >= 3) {
      bigrams.push(`${a} ${b}`);
    }
  }

  // Deduplicate: prefer bigrams; include singles not already covered
  const seen = new Set<string>();
  const result: string[] = [];

  for (const bg of bigrams) {
    if (!seen.has(bg)) {
      seen.add(bg);
      result.push(bg);
    }
  }
  for (const w of tokens) {
    const coveredByBigram = result.some((bg) => bg.includes(w));
    if (!coveredByBigram && !seen.has(w)) {
      seen.add(w);
      result.push(w);
    }
  }

  // Cap to avoid overwhelming the UI; prioritise bigrams (already first)
  return result.slice(0, 20);
}

function matchKeywords(
  keywords: string[],
  resume: string,
): { found: string[]; missing: string[] } {
  const lower = resume.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of keywords) {
    (lower.includes(kw) ? found : missing).push(kw);
  }
  // Show at most 8 in each bucket to keep the UI scannable
  return { found: found.slice(0, 8), missing: missing.slice(0, 8) };
}

// ── non-deceptive fallback when AI key is not configured ─────────────────────
// Shows the original resume plus a clearly-labelled revision guide.
// Nothing is added as asserted experience — the user must write their own
// bullets based on their real history.
function buildRevisionTemplate(resume: string, missing: string[]): string {
  const suggestions = missing
    .map((kw) => `  • "${kw}" — add a bullet describing a real project where you applied this`)
    .join("\n");

  return `${resume}

══════════════════════════════════════════════════════
📝  REVISION GUIDE  (AI key not connected — edit manually)
══════════════════════════════════════════════════════
Your resume above is unchanged. The keywords below are missing
from your resume but appear in the job description.

Add them only where you have genuine, verifiable experience.
Fabricating bullets is harmful to your candidacy and is never
recommended.

MISSING KEYWORDS — suggested addition points:
${suggestions}

NEXT STEP: Connect the OpenAI integration (task in your project
list) to let Axiom rewrite these for you automatically.
══════════════════════════════════════════════════════`;
}

type ComposeState = "idle" | "composing" | "done";
type CopyState = "idle" | "copied";
type ShareState = "idle" | "sharing" | "done" | "error";
type ImageState = "idle" | "generating" | "done" | "error";
type ImageSize = "square" | "wide" | "tall";
type AtsState = "idle" | "matching" | "done";
type FixState = "idle" | "fixing" | "done" | "error";
type RecheckState = "idle" | "checking" | "done";

interface MatchResult {
  score: number;
  found: string[];
  missing: string[];
}

const IMAGE_SIZE_LABELS: Record<ImageSize, string> = {
  square: "Square (1024×1024)",
  wide: "Wide (1536×1024)",
  tall: "Tall (1024×1536)",
};

export default function Compose() {
  const [jobDescription, setJobDescription] = useState(
    "Senior Product Designer at Axiom — 5+ yrs B2B SaaS, Figma, systems thinking, cross-functional collaboration, design systems, user research, stakeholder alignment, component library.",
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

  // ── image generation state ─────────────────────────────────────────────────
  const [imagePrompt, setImagePrompt] = useState(
    "professional LinkedIn banner for a software engineer",
  );
  const [imageSize, setImageSize] = useState<ImageSize>("wide");
  const [imageState, setImageState] = useState<ImageState>("idle");
  const [imageData, setImageData] = useState<string>("");
  const [imageError, setImageError] = useState("");
  const [imageRemaining, setImageRemaining] = useState<number>(5);
  const [imageSizeResult, setImageSizeResult] = useState<ImageSize>("wide");

  // ── image history ──────────────────────────────────────────────────────────
  interface HistoryImage {
    id: string;
    prompt: string;
    size: ImageSize;
    image_data_b64: string;
    created_at: string;
  }
  const [imageHistory, setImageHistory] = useState<HistoryImage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/v1/image/history")
      .then((r) => r.json())
      .then((data: { images?: HistoryImage[] }) => {
        if (data.images && data.images.length > 0) {
          setImageHistory(data.images);
          // Pre-load the most recent image into the active viewer
          const latest = data.images[0]!;
          setImageData(`data:image/png;base64,${latest.image_data_b64}`);
          setImageSizeResult(latest.size);
          setImageState("done");
          setImagePrompt(latest.prompt);
          setImageSize(latest.size);
        }
      })
      .catch(() => {/* non-fatal — history just won't show */})
      .finally(() => setHistoryLoaded(true));
  }, []);

  // ── ATS match state ────────────────────────────────────────────────────────
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [atsState, setAtsState] = useState<AtsState>("idle");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // ── fix gaps state ─────────────────────────────────────────────────────────
  const [fixState, setFixState] = useState<FixState>("idle");
  const [fixResultText, setFixResultText] = useState("");
  const [fixCopyState, setFixCopyState] = useState<CopyState>("idle");
  const [fixShareState, setFixShareState] = useState<ShareState>("idle");
  const [fixShareUrl, setFixShareUrl] = useState("");
  const [fixShareError, setFixShareError] = useState("");
  const [fixUrlCopied, setFixUrlCopied] = useState(false);
  const [fixDialogOpen, setFixDialogOpen] = useState(false);

  // ── before/after ATS score state ──────────────────────────────────────────
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [recheckState, setRecheckState] = useState<RecheckState>("idle");
  const [afterScore, setAfterScore] = useState<number | null>(null);
  // Immutable snapshots captured atomically at match time — Fix Gaps and Re-check
  // use these so later edits to the live inputs never skew the before/after delta.
  const [jdSnapshot, setJdSnapshot] = useState<string>("");
  const [resumeSnapshot, setResumeSnapshot] = useState<string>("");
  // True when the AI wasn't available and buildRevisionTemplate was used (resume unchanged)
  const [isFallbackResult, setIsFallbackResult] = useState(false);

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

  // ── generate image — calls POST /api/v1/image/generate ──────────────────
  async function handleGenerateImage() {
    if (!imagePrompt.trim()) return;
    setImageState("generating");
    setImageData("");
    setImageError("");

    try {
      const res = await fetch("/api/v1/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt.trim(), size: imageSize }),
      });

      if (res.status === 429) {
        throw new Error("Rate limit reached — you've used all 5 free image generations for this session.");
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(body.detail ?? body.error ?? `Server error ${res.status}`);
      }

      const data = (await res.json()) as {
        b64_json: string;
        size: ImageSize;
        remaining: number;
        image_id?: string;
      };

      const dataUrl = `data:image/png;base64,${data.b64_json}`;
      setImageData(dataUrl);
      setImageSizeResult(data.size);
      setImageRemaining(data.remaining);
      setImageState("done");

      // Add to local history so the strip updates immediately (without refetch)
      const persistedId = data.image_id;
      if (persistedId) {
        const newEntry: HistoryImage = {
          id: persistedId,
          prompt: imagePrompt.trim(),
          size: data.size,
          image_data_b64: data.b64_json,
          created_at: new Date().toISOString(),
        };
        setImageHistory((prev) => [newEntry, ...prev].slice(0, 10));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setImageError(message);
      setImageState("error");
    }
  }

  // ── download generated image ───────────────────────────────────────────────
  function handleDownloadImage() {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = `axiom-visual-${imageSizeResult}.png`;
    a.click();
  }

  // ── ATS match — extracts keywords from the actual JD, then checks resume ──
  function handleRunMatch() {
    if (!resume.trim() || !jobDescription.trim()) return;
    setAtsState("matching");
    setMatchResult(null);
    setFixState("idle");
    setFixResultText("");
    // Reset any pending re-check state so stale deltas don't survive a new match
    setBeforeScore(null);
    setAfterScore(null);
    setRecheckState("idle");
    setIsFallbackResult(false);

    // Capture exact resume + JD at match time so Fix Gaps and Re-check always
    // operate on the same inputs regardless of later edits to the live fields.
    const jdAtMatchTime = jobDescription;
    const resumeAtMatchTime = resume;

    setTimeout(() => {
      const keywords = extractKeywordsFromJd(jdAtMatchTime);
      const { found, missing } = matchKeywords(keywords, resumeAtMatchTime);
      const total = found.length + missing.length;
      const score = total > 0 ? Math.round((found.length / total) * 100) : 0;
      setMatchResult({ score, found, missing });
      setJdSnapshot(jdAtMatchTime);
      setResumeSnapshot(resumeAtMatchTime);
      setAtsState("done");
    }, 1600);
  }

  // ── fix gaps — calls POST /api/v1/compose, falls back to simulation ────────
  async function handleFixGaps() {
    if (!matchResult) return;
    setFixState("fixing");
    setFixResultText("");
    setFixShareState("idle");
    setFixShareUrl("");
    setFixShareError("");
    setBeforeScore(matchResult.score);
    setIsFallbackResult(false);
    setRecheckState("idle");
    setAfterScore(null);

    try {
      const res = await fetch("/api/v1/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "tailor",
          document: resumeSnapshot,
          context: jdSnapshot,
          missingKeywords: matchResult.missing,
        }),
      });

      if (res.status === 503) {
        // AI not yet configured — show a revision guide (no fabricated text)
        await new Promise((r) => setTimeout(r, 1400));
        setFixResultText(buildRevisionTemplate(resumeSnapshot, matchResult.missing));
        setIsFallbackResult(true);
        setFixState("done");
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(body.detail ?? body.error ?? `Server error ${res.status}`);
      }

      const data = (await res.json()) as { result_text: string };
      setFixResultText(data.result_text);
      setFixState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setFixResultText(message);
      setFixState("error");
    }
  }

  // ── re-check ATS score on the fixed resume ───────────────────────────────
  function handleRecheckScore() {
    if (!fixResultText.trim() || !jdSnapshot.trim()) return;
    setRecheckState("checking");
    setAfterScore(null);
    setTimeout(() => {
      // Always use the JD snapshot captured at fix time so edits don't skew comparison
      const keywords = extractKeywordsFromJd(jdSnapshot);
      const { found, missing } = matchKeywords(keywords, fixResultText);
      const total = found.length + missing.length;
      const score = total > 0 ? Math.round((found.length / total) * 100) : 0;
      setAfterScore(score);
      setRecheckState("done");
    }, 1400);
  }

  // ── fix result actions ─────────────────────────────────────────────────────
  async function handleFixCopy() {
    await navigator.clipboard.writeText(fixResultText);
    setFixCopyState("copied");
    setTimeout(() => setFixCopyState("idle"), 2000);
  }

  function handleFixDownload() {
    const blob = new Blob([fixResultText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "axiom-tailored-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFixShare() {
    setFixShareState("sharing");
    setFixShareError("");
    setFixDialogOpen(true);
    try {
      const res = await fetch("/api/v1/compose/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result_text: fixResultText, doc_type: "", intent: "tailor" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      const data = (await res.json()) as { url: string; slug: string; expires_at: string };
      setFixShareUrl(data.url);
      setFixShareState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setFixShareError(message);
      setFixShareState("error");
    }
  }

  async function handleFixCopyUrl() {
    await navigator.clipboard.writeText(fixShareUrl);
    setFixUrlCopied(true);
    setTimeout(() => setFixUrlCopied(false), 2000);
  }

  const hasResult = composeState === "done" && resultText.length > 0;
  const hasImage = imageState === "done" && imageData.length > 0;
  const hasFixResult = fixState === "done" && fixResultText.length > 0;

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

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">

        {/* ── ATS match ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-white/40" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
              ATS Match
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Your Resume
            </label>
            <Textarea
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none min-h-[160px] focus-visible:ring-1 focus-visible:ring-white/20 font-mono text-xs leading-relaxed"
              placeholder="Paste your current resume here…"
              value={resume}
              onChange={(e) => {
                setResume(e.target.value);
                setAtsState("idle");
                setMatchResult(null);
                setFixState("idle");
                setFixResultText("");
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Job Description
            </label>
            <Textarea
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none min-h-[80px] focus-visible:ring-1 focus-visible:ring-white/20"
              placeholder="Paste the job description…"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setAtsState("idle");
                setMatchResult(null);
                setFixState("idle");
                setFixResultText("");
              }}
            />
          </div>

          <Button
            onClick={handleRunMatch}
            disabled={atsState === "matching" || !resume.trim() || !jobDescription.trim()}
            className="w-full h-11 bg-white/10 text-white font-medium border border-white/10 hover:bg-white/15 disabled:opacity-40"
          >
            {atsState === "matching" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Run ATS Match
              </>
            )}
          </Button>

          {/* ── matching skeleton ── */}
          {atsState === "matching" && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
              {[45, 70, 55].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded-full bg-white/8 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}

          {/* ── match results ── */}
          {matchResult && atsState === "done" && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
              {/* score */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                  Match Score
                </span>
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    matchResult.score >= 70
                      ? "text-emerald-400"
                      : matchResult.score >= 45
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {matchResult.score}%
                </span>
              </div>

              {/* score bar */}
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    matchResult.score >= 70
                      ? "bg-emerald-400"
                      : matchResult.score >= 45
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${matchResult.score}%` }}
                />
              </div>

              {/* found keywords */}
              {matchResult.found.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-white/35 uppercase tracking-widest font-medium">
                    ✓ Found
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.found.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-emerald-500/12 text-emerald-400 border border-emerald-500/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* missing keywords */}
              {matchResult.missing.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-white/35 uppercase tracking-widest font-medium">
                    ✗ Missing
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-500/12 text-red-400 border border-red-500/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* fix gaps button */}
              {matchResult.missing.length > 0 && (
                <div className="pt-1 border-t border-white/8">
                  <Button
                    onClick={handleFixGaps}
                    disabled={fixState === "fixing"}
                    className="w-full h-10 bg-white text-black font-medium hover:bg-white/90 disabled:opacity-40 gap-2"
                  >
                    {fixState === "fixing" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rewriting resume…
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle className="w-4 h-4" />
                        Fix Gaps
                      </>
                    )}
                  </Button>
                </div>
              )}

              {matchResult.missing.length === 0 && (
                <p className="text-xs text-emerald-400/80 pt-1">
                  🎉 All tracked keywords are present — your resume is a strong match.
                </p>
              )}
            </div>
          )}

          {/* ── fix gaps result ── */}
          {(fixState === "fixing" || hasFixResult || fixState === "error") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                  Tailored Resume
                </span>
                {hasFixResult && (
                  <div className="flex items-center gap-2">
                    {/* Copy */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFixCopy}
                      className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5"
                    >
                      {fixCopyState === "copied" ? (
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
                      onClick={handleFixDownload}
                      className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-xs">Download</span>
                    </Button>

                    {/* Share */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFixShare}
                      disabled={fixShareState === "sharing"}
                      className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5 disabled:opacity-40"
                    >
                      {fixShareState === "sharing" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-xs">Sharing…</span>
                        </>
                      ) : fixShareState === "done" ? (
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

              {fixState === "fixing" && (
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

              {hasFixResult && (
                <>
                  <div className="rounded-xl border border-white/8 bg-white/3 p-6">
                    <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans">
                      {fixResultText}
                    </pre>
                  </div>

                  {/* ── before/after score panel ── */}
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                        ATS Score Check
                      </span>
                      {!isFallbackResult && recheckState !== "done" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRecheckScore}
                          disabled={recheckState === "checking"}
                          className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5 disabled:opacity-40"
                        >
                          {recheckState === "checking" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span className="text-xs">Checking…</span>
                            </>
                          ) : (
                            <>
                              <Target className="w-3.5 h-3.5" />
                              <span className="text-xs">Re-check score</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {isFallbackResult && (
                      <p className="text-xs text-white/35">
                        Before fix: <span className={`font-semibold tabular-nums ${beforeScore !== null && beforeScore >= 70 ? "text-emerald-400" : beforeScore !== null && beforeScore >= 45 ? "text-amber-400" : "text-red-400"}`}>{beforeScore}%</span>
                        {" "}· AI wasn't available — your resume above is unchanged. Apply the revision guide manually, then re-paste your resume and run ATS Match again.
                      </p>
                    )}

                    {!isFallbackResult && recheckState === "idle" && beforeScore !== null && (
                      <p className="text-xs text-white/35">
                        Before fix: <span className={`font-semibold tabular-nums ${beforeScore >= 70 ? "text-emerald-400" : beforeScore >= 45 ? "text-amber-400" : "text-red-400"}`}>{beforeScore}%</span>
                        {" "}· Click Re-check score to see the improvement.
                      </p>
                    )}

                    {recheckState === "checking" && (
                      <div className="flex gap-2">
                        {[40, 60, 45].map((w, i) => (
                          <div key={i} className="h-2.5 rounded-full bg-white/8 animate-pulse flex-1" style={{ maxWidth: `${w}%` }} />
                        ))}
                      </div>
                    )}

                    {recheckState === "done" && beforeScore !== null && afterScore !== null && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold tabular-nums ${beforeScore >= 70 ? "text-emerald-400" : beforeScore >= 45 ? "text-amber-400" : "text-red-400"}`}>
                            {beforeScore}%
                          </span>
                          <span className="text-white/30 text-lg">→</span>
                          <span className={`text-2xl font-bold tabular-nums ${afterScore >= 70 ? "text-emerald-400" : afterScore >= 45 ? "text-amber-400" : "text-red-400"}`}>
                            {afterScore}%
                          </span>
                          {afterScore > beforeScore ? (
                            <span className="ml-1 text-sm font-semibold text-emerald-400">
                              +{afterScore - beforeScore} pts
                            </span>
                          ) : afterScore === beforeScore ? (
                            <span className="ml-1 text-sm text-white/40">no change</span>
                          ) : (
                            <span className="ml-1 text-sm font-semibold text-red-400">
                              {afterScore - beforeScore} pts
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${beforeScore >= 70 ? "bg-emerald-400/40" : beforeScore >= 45 ? "bg-amber-400/40" : "bg-red-400/40"}`} style={{ width: `${beforeScore}%` }} />
                          </div>
                          <span className="text-white/20 text-xs">→</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${afterScore >= 70 ? "bg-emerald-400" : afterScore >= 45 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${afterScore}%` }} />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRecheckScore}
                          className="h-7 px-2 text-white/30 hover:text-white/60 hover:bg-white/5 gap-1 text-xs"
                        >
                          <Target className="w-3 h-3" />
                          Re-check again
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {fixState === "error" && (
                <p className="text-sm text-red-400 px-1">{fixResultText}</p>
              )}
            </section>
          )}
        </section>

        {/* ── compose ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white/40" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Compose Document
            </span>
          </div>

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

        {/* ── compose result ── */}
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

        {/* ── add visual ── */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-white/40" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Add Visual
            </span>
            <span className="ml-auto text-xs text-white/25">
              {imageRemaining} / 5 remaining
            </span>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Description
              </label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10 focus-visible:ring-1 focus-visible:ring-white/20"
                placeholder="e.g. professional LinkedIn banner for a software engineer"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                disabled={imageState === "generating" || imageRemaining === 0}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Size
              </label>
              <Select
                value={imageSize}
                onValueChange={(v) => setImageSize(v as ImageSize)}
                disabled={imageState === "generating" || imageRemaining === 0}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {(Object.entries(IMAGE_SIZE_LABELS) as [ImageSize, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateImage}
              disabled={
                imageState === "generating" ||
                !imagePrompt.trim() ||
                imageRemaining === 0
              }
              className="w-full h-10 bg-white/10 text-white font-medium border border-white/10 hover:bg-white/15 disabled:opacity-40"
            >
              {imageState === "generating" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : imageRemaining === 0 ? (
                "No generations remaining"
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            {/* ── generating skeleton ── */}
            {imageState === "generating" && (
              <div
                className="rounded-lg bg-white/5 border border-white/8 animate-pulse"
                style={{
                  aspectRatio: imageSize === "square" ? "1 / 1" : imageSize === "wide" ? "1536 / 1024" : "1024 / 1536",
                }}
              />
            )}

            {/* ── result image ── */}
            {hasImage && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-white/8">
                  <img
                    src={imageData}
                    alt={imagePrompt}
                    className="w-full block"
                    style={{
                      aspectRatio:
                        imageSizeResult === "square"
                          ? "1 / 1"
                          : imageSizeResult === "wide"
                            ? "1536 / 1024"
                            : "1024 / 1536",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">
                    {IMAGE_SIZE_LABELS[imageSizeResult]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadImage}
                    className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/8 gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── error ── */}
            {imageState === "error" && imageError && (
              <p className="text-sm text-red-400">{imageError}</p>
            )}
          </div>

          {/* ── history strip ── */}
          {historyLoaded && imageHistory.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-white/35 uppercase tracking-widest">
                Previously generated
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {imageHistory.map((img) => (
                  <button
                    key={img.id}
                    title={img.prompt}
                    onClick={() => {
                      setImageData(`data:image/png;base64,${img.image_data_b64}`);
                      setImageSizeResult(img.size);
                      setImagePrompt(img.prompt);
                      setImageSize(img.size);
                      setImageState("done");
                      setImageError("");
                    }}
                    className={`shrink-0 rounded-md overflow-hidden border transition-all ${
                      imageData === `data:image/png;base64,${img.image_data_b64}`
                        ? "border-white/50 ring-1 ring-white/30"
                        : "border-white/10 hover:border-white/30"
                    }`}
                    style={{
                      width: img.size === "tall" ? 40 : 64,
                      height: img.size === "wide" ? 40 : 64,
                    }}
                  >
                    <img
                      src={`data:image/png;base64,${img.image_data_b64}`}
                      alt={img.prompt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── compose share dialog ── */}
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
                Anyone with this link can view the document. It expires in 30 days.
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
                  {urlCopied ? <Check className="w-3.5 h-3.5" /> : "Copy link"}
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

      {/* ── fix gaps share dialog ── */}
      <Dialog open={fixDialogOpen} onOpenChange={setFixDialogOpen}>
        <DialogContent className="bg-[#161616] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              {fixShareState === "sharing"
                ? "Creating share link…"
                : fixShareState === "done"
                  ? "Link ready"
                  : "Share failed"}
            </DialogTitle>
          </DialogHeader>

          {fixShareState === "sharing" && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-white/40" />
            </div>
          )}

          {fixShareState === "done" && fixShareUrl && (
            <div className="space-y-4 pt-1">
              <p className="text-sm text-white/50">
                Anyone with this link can view the document. It expires in 30 days.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 truncate font-mono">
                  {fixShareUrl}
                </div>
                <Button
                  size="sm"
                  onClick={handleFixCopyUrl}
                  className="shrink-0 h-8 px-3 bg-white text-black hover:bg-white/90 text-xs"
                >
                  {fixUrlCopied ? <Check className="w-3.5 h-3.5" /> : "Copy link"}
                </Button>
              </div>
            </div>
          )}

          {fixShareState === "error" && (
            <p className="text-sm text-red-400 pt-1">
              {fixShareError || "Something went wrong. Please try again."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
