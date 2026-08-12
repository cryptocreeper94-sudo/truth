import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Terminal, Activity, Shield, AlertTriangle,
  CheckCircle, HelpCircle, XCircle, Minus, ExternalLink,
  Copy, ChevronRight, Loader2, Search
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type ClaimLabel = "DOCUMENTED" | "CONTESTED" | "SPECULATIVE" | "REFUTED" | "UNVERIFIABLE";
type VerifyStep = "queued" | "downloading" | "transcribing" | "extracting" | "verifying" | "done" | "error";

interface VerifyClaim {
  id: number;
  text: string;
  label: ClaimLabel;
  rationale: string;
  timecode?: string;
  sources: Array<{ title: string; url: string }>;
}

interface VerifyResult {
  videoTitle: string;
  videoPlatform: string;
  thumbnailUrl?: string;
  summary: string;
  claims: VerifyClaim[];
}

interface JobStatus {
  jobId: string;
  step: VerifyStep;
  stepLabel: string;
  progress: number;
  error: string | null;
  shareSlug: string | null;
  result: VerifyResult | null;
}

// ── Label config ─────────────────────────────────────────────────────────────
const LABEL_CONFIG: Record<ClaimLabel, {
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
  darkColor: string;
  darkBg: string;
  darkBorder: string;
}> = {
  DOCUMENTED: {
    color: "text-[#2dd4bf]",
    bg: "bg-[#2dd4bf]/10",
    border: "border-[#2dd4bf]/30",
    icon: CheckCircle,
    darkColor: "text-[#2dd4bf]",
    darkBg: "bg-[#2dd4bf]/10",
    darkBorder: "border-[#2dd4bf]/30",
  },
  CONTESTED: {
    color: "text-[#fb7185]",
    bg: "bg-[#fb7185]/10",
    border: "border-[#fb7185]/30",
    icon: AlertTriangle,
    darkColor: "text-[#fb7185]",
    darkBg: "bg-[#fb7185]/10",
    darkBorder: "border-[#fb7185]/30",
  },
  SPECULATIVE: {
    color: "text-[#c084fc]",
    bg: "bg-[#c084fc]/10",
    border: "border-[#c084fc]/30",
    icon: HelpCircle,
    darkColor: "text-[#c084fc]",
    darkBg: "bg-[#c084fc]/10",
    darkBorder: "border-[#c084fc]/30",
  },
  REFUTED: {
    color: "text-[#f97316]",
    bg: "bg-[#f97316]/10",
    border: "border-[#f97316]/30",
    icon: XCircle,
    darkColor: "text-[#f97316]",
    darkBg: "bg-[#f97316]/10",
    darkBorder: "border-[#f97316]/30",
  },
  UNVERIFIABLE: {
    color: "text-[rgba(240,240,248,0.4)]",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: Minus,
    darkColor: "text-[rgba(240,240,248,0.4)]",
    darkBg: "bg-white/5",
    darkBorder: "border-white/10",
  },
};

// ── TiltCard (shared pattern from home page) ─────────────────────────────────
function useTilt(ref: React.RefObject<HTMLElement | null>, maxDeg = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.transform = `perspective(800px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg)`;
    };
    const onLeave = () => {
      el.style.transition = "transform 0.5s ease-out";
      el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
      setTimeout(() => { if (el) el.style.transition = ""; }, 500);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [maxDeg, ref]);
}

function TiltCard({ children, className = "", maxDeg = 6 }: {
  children: React.ReactNode;
  className?: string;
  maxDeg?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, maxDeg);
  return (
    <div ref={ref} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

// ── Progress stepper ─────────────────────────────────────────────────────────
const STEPS: Array<{ key: VerifyStep; label: string }> = [
  { key: "downloading",  label: "Downloading"     },
  { key: "transcribing", label: "Transcribing"    },
  { key: "extracting",   label: "Reading claims"  },
  { key: "verifying",    label: "Checking sources"},
  { key: "done",         label: "Done"            },
];

function ProgressStepper({ step, progress }: { step: VerifyStep; progress: number }) {
  const currentIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="w-full">
      {/* Bar */}
      <div className="h-[2px] w-full bg-white/10 mb-6 relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#22d3ee]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      {/* Steps */}
      <div className="flex justify-between">
        {STEPS.map((s, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          return (
            <div key={s.key} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                done ? "bg-[#22d3ee]" : active ? "bg-[#22d3ee] animate-pulse" : "bg-white/20"
              }`} />
              <span className={`font-mono text-[9px] tracking-widest uppercase hidden sm:block ${
                done || active ? "text-[#22d3ee]" : "text-white/30"
              }`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Claim card ───────────────────────────────────────────────────────────────
function ClaimCard({ claim, index }: { claim: VerifyClaim; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = LABEL_CONFIG[claim.label];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <TiltCard maxDeg={3}>
        <div
          className={`border ${cfg.darkBorder} ${cfg.darkBg} p-6 cursor-pointer transition-all duration-200 hover:border-opacity-60`}
          onClick={() => setExpanded((e) => !e)}
        >
          {/* Header row */}
          <div className="flex items-start gap-4">
            {/* Number */}
            <span className="font-mono text-[10px] text-white/30 tracking-widest pt-0.5 min-w-[2ch]">
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Label badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 border ${cfg.darkBorder} ${cfg.darkBg} shrink-0`}>
              <Icon className={`w-3 h-3 ${cfg.darkColor}`} />
              <span className={`font-mono text-[9px] tracking-widest font-bold uppercase ${cfg.darkColor}`}>
                {claim.label}
              </span>
            </div>

            {/* Claim text */}
            <p className="text-[#f0f0f8] text-sm leading-relaxed flex-1 font-mono">
              {claim.text}
            </p>

            {/* Timecode */}
            {claim.timecode && (
              <span className="font-mono text-[9px] text-white/30 tracking-widest shrink-0 pt-0.5">
                {claim.timecode}
              </span>
            )}

            {/* Expand caret */}
            <ChevronRight
              className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            />
          </div>

          {/* Expanded detail */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-5 ml-[calc(2ch+1rem)] pl-4 border-l border-white/10 space-y-4">
                  {/* Rationale */}
                  <p className="font-mono text-xs text-white/60 leading-relaxed">
                    {claim.rationale}
                  </p>

                  {/* Sources */}
                  {claim.sources.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase">Sources</p>
                      {claim.sources.map((src, si) => (
                        <a
                          key={si}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 font-mono text-[11px] text-[#22d3ee] hover:text-[#2dd4bf] transition-colors group"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="underline underline-offset-2 decoration-[#22d3ee]/40 group-hover:decoration-[#22d3ee]">
                            {src.title}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ── Label summary bar ─────────────────────────────────────────────────────────
function LabelSummary({ claims }: { claims: VerifyClaim[] }) {
  const counts = claims.reduce((acc, c) => {
    acc[c.label] = (acc[c.label] ?? 0) + 1;
    return acc;
  }, {} as Record<ClaimLabel, number>);

  const labels: ClaimLabel[] = ["DOCUMENTED", "CONTESTED", "SPECULATIVE", "REFUTED", "UNVERIFIABLE"];

  return (
    <div className="flex flex-wrap gap-3">
      {labels.map((label) => {
        const n = counts[label] ?? 0;
        if (n === 0) return null;
        const cfg = LABEL_CONFIG[label];
        const Icon = cfg.icon;
        return (
          <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 border ${cfg.darkBorder} ${cfg.darkBg}`}>
            <Icon className={`w-3 h-3 ${cfg.darkColor}`} />
            <span className={`font-mono text-[9px] tracking-widest font-bold ${cfg.darkColor}`}>{label}</span>
            <span className="font-mono text-[9px] text-white/40 ml-1">{n}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Share button ─────────────────────────────────────────────────────────────
function ShareButton({ shareSlug }: { shareSlug: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}verify/report/${shareSlug}`;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-[#22d3ee]/50 font-mono text-[10px] tracking-widest text-white/50 hover:text-[#22d3ee] transition-all uppercase"
    >
      <Copy className="w-3 h-3" />
      {copied ? "Copied!" : "Copy share link"}
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Verify() {
  const [url, setUrl] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    if (!url.trim()) {
      setInputError("Please enter a video URL.");
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setInputError("That doesn't look like a valid URL. Try something like https://youtube.com/...");
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setJobId(null);

    try {
      const res = await fetch(`${BASE}/api/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        setInputError(body.detail ?? "Couldn't start verification. Please try again.");
        setSubmitting(false);
        return;
      }

      const data = await res.json() as { jobId: string };
      setJobId(data.jobId);
      setSubmitting(false);
    } catch {
      setInputError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }, [url, BASE]);

  // ── Poll for job status ────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/api/v1/verify/${jobId}`);
        if (!res.ok) return;
        const data = await res.json() as JobStatus;
        setStatus(data);

        if (data.step === "done" || data.step === "error") {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // silently retry
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [jobId, BASE]);

  const isProcessing = jobId && status && status.step !== "done" && status.step !== "error";
  const isDone = status?.step === "done";
  const isError = status?.step === "error";

  return (
    <div className="min-h-screen bg-[#0c0c14] overflow-hidden selection:bg-[#22d3ee]/30">

      {/* Nav — same as home */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.12)] bg-[#0c0c14]/80 backdrop-blur-md text-[#f0f0f8]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#22d3ee]" />
            <a href={`${BASE}/`} className="font-mono text-sm tracking-widest font-bold hover:text-[#22d3ee] transition-colors">
              AXIOM<span className="text-[#22d3ee]">.SYS</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <a href="/api/demo/compose.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Compose</a>
            <a href="/api/demo/index.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Chat</a>
            <a href="/api/demo/image.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Images</a>
            <span className="font-mono text-[11px] tracking-widest text-[#22d3ee] uppercase font-bold border-b border-[#22d3ee]/50">Verify</span>
          </div>
        </div>
      </nav>

      {/* ── Hero / Submit (Dark) ─────────────────────────────────────────── */}
      <section className="section-dark min-h-[60dvh] flex items-center pt-14">
        <div className="max-w-5xl mx-auto px-6 w-full py-24">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <Shield className="w-4 h-4 text-[#22d3ee]" />
            <span className="font-mono text-[10px] tracking-widest text-[#22d3ee] uppercase font-bold">
              Deterministic Verification Engine
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black uppercase leading-[0.92] tracking-tight mb-8"
          >
            WHAT IS THIS<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#c084fc]">
              VIDEO CLAIMING?
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-mono text-[rgba(255,255,255,0.6)] text-sm leading-relaxed max-w-2xl mb-12"
          >
            Paste any public video link. The engine downloads it, extracts every spoken claim,
            and checks each one against documented sources. You get a plain-English report
            showing what is established fact, what is disputed, what goes beyond the evidence,
            and what couldn't be verified — with no editorial spin either way.
          </motion.p>

          {/* URL input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row gap-0 border border-[rgba(255,255,255,0.2)] focus-within:border-[#22d3ee]/60 transition-colors">
              <div className="flex items-center gap-3 flex-1 bg-[rgba(26,26,46,0.60)] px-5">
                <Search className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setInputError(null); }}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={submitting || !!isProcessing}
                  className="flex-1 bg-transparent py-4 font-mono text-sm text-[#f0f0f8] placeholder:text-white/25 outline-none disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !!isProcessing}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#22d3ee] text-[#0c0c14] font-mono text-sm font-bold tracking-wider hover:bg-[#2dd4bf] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    VERIFY
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {inputError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 font-mono text-xs text-[#fb7185]"
              >
                {inputError}
              </motion.p>
            )}

            <p className="mt-3 font-mono text-[9px] text-white/25 tracking-widest uppercase">
              Supports YouTube · Facebook · Rumble · TikTok · X · BitChute · Odysee · 1000+ platforms
            </p>
          </motion.form>
        </div>
      </section>

      {/* ── Processing state ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isProcessing && status && (
          <motion.section
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="section-creme border-t border-[rgba(0,0,0,0.1)] py-20"
          >
            <div className="max-w-3xl mx-auto px-6">
              <div className="flex items-center gap-2 mb-8">
                <Loader2 className="w-4 h-4 text-[#c084fc] animate-spin" />
                <span className="font-mono text-[10px] tracking-widest text-[#c084fc] uppercase font-bold">
                  {status.stepLabel}
                </span>
              </div>
              <ProgressStepper step={status.step} progress={status.progress} />
              <p className="mt-8 font-mono text-xs text-[#0c0c14]/50 leading-relaxed">
                This can take 1–3 minutes depending on the video length. The engine downloads the
                audio, transcribes every word, identifies testable claims, and checks each one
                against documented sources. Don't close this tab.
              </p>
            </div>
          </motion.section>
        )}

        {/* ── Error state ───────────────────────────────────────────────── */}
        {isError && status && (
          <motion.section
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="section-dark border-t border-[rgba(255,255,255,0.12)] py-20"
          >
            <div className="max-w-3xl mx-auto px-6">
              <div className="flex items-start gap-4 border border-[#fb7185]/30 bg-[#fb7185]/5 p-8">
                <AlertTriangle className="w-5 h-5 text-[#fb7185] mt-0.5 shrink-0" />
                <div>
                  <p className="font-mono text-sm font-bold text-[#fb7185] mb-2 uppercase tracking-widest">
                    Verification Failed
                  </p>
                  <p className="font-mono text-sm text-white/70 leading-relaxed">
                    {status.error ?? "Something went wrong. Please try a different URL."}
                  </p>
                  <button
                    onClick={() => { setJobId(null); setStatus(null); setUrl(""); }}
                    className="mt-6 font-mono text-[10px] tracking-widest text-[#22d3ee] hover:text-[#2dd4bf] transition-colors uppercase"
                  >
                    Try another URL →
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Report ───────────────────────────────────────────────────── */}
        {isDone && status?.result && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Report header (Crème) */}
            <section className="section-creme border-t border-[rgba(0,0,0,0.1)] py-20">
              <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-2 mb-8">
                  <CheckCircle className="w-4 h-4 text-[#2dd4bf]" />
                  <span className="font-mono text-[10px] tracking-widest text-[#2dd4bf] uppercase font-bold">
                    Verification Report
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
                  <div>
                    {/* Platform tag */}
                    <p className="font-mono text-[9px] tracking-widest text-[#0c0c14]/40 uppercase mb-2">
                      {status.result.videoPlatform}
                    </p>

                    {/* Video title */}
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#0c0c14] leading-[0.95] mb-6">
                      {status.result.videoTitle}
                    </h2>

                    {/* Summary */}
                    <p className="font-mono text-sm text-[#0c0c14]/70 leading-relaxed max-w-2xl mb-8">
                      {status.result.summary}
                    </p>

                    {/* Label counts */}
                    <LabelSummary claims={status.result.claims} />
                  </div>

                  {/* Thumbnail */}
                  {status.result.thumbnailUrl && (
                    <TiltCard maxDeg={4} className="w-full lg:w-64 shrink-0">
                      <div className="border border-[rgba(0,0,0,0.1)] overflow-hidden">
                        <img
                          src={status.result.thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-full aspect-video object-cover hover-color-img"
                        />
                      </div>
                    </TiltCard>
                  )}
                </div>

                {/* Share */}
                {status.shareSlug && (
                  <div className="mt-10 pt-8 border-t border-[rgba(0,0,0,0.08)]">
                    <ShareButton shareSlug={status.shareSlug} />
                  </div>
                )}
              </div>
            </section>

            {/* Claims list (Dark) */}
            <section className="section-dark border-t border-[rgba(255,255,255,0.12)] py-20">
              <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-4 h-4 text-[#c084fc]" />
                  <span className="font-mono text-[10px] tracking-widest text-[#c084fc] uppercase font-bold">
                    {status.result.claims.length} Claims Extracted
                  </span>
                </div>
                <p className="font-mono text-[10px] text-white/30 mb-10">
                  Click any claim to expand rationale and sources.
                </p>

                <div className="space-y-3">
                  {status.result.claims.map((claim, i) => (
                    <ClaimCard key={claim.id} claim={claim} index={i} />
                  ))}
                </div>

                {/* Try another */}
                <div className="mt-16 pt-10 border-t border-white/10">
                  <button
                    onClick={() => { setJobId(null); setStatus(null); setUrl(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="group inline-flex items-center gap-2 font-mono text-sm font-bold tracking-wider text-[#22d3ee] hover:text-[#2dd4bf] transition-colors"
                  >
                    Verify another video
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── How it works (Crème) — always visible unless report is showing ── */}
      {!jobId && (
        <section className="section-creme border-t border-[rgba(0,0,0,0.1)] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="font-mono text-[10px] text-[#c084fc] tracking-widest mb-14 flex items-center gap-2 font-bold">
              <Terminal className="w-4 h-4" />
              <span>HOW IT WORKS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { n: "01", label: "Download", desc: "The engine fetches the video from any public platform — no cooperation from the platform required." },
                { n: "02", label: "Transcribe", desc: "Every word of narration is extracted with timestamps using speech recognition trained on real audio." },
                { n: "03", label: "Extract claims", desc: "Specific, testable factual statements are identified and separated from opinion and speculation." },
                { n: "04", label: "Check sources", desc: "Each claim is cross-referenced against documented research, primary data, and institutional records." },
                { n: "05", label: "Report", desc: "You receive an honest label on each claim — no editorial spin, no suppression of inconvenient findings." },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="space-y-4"
                >
                  <div className="font-mono text-4xl font-black text-[#0c0c14]/10">{step.n}</div>
                  <div className="w-8 h-[2px] bg-[#22d3ee]" />
                  <h3 className="font-mono text-xs font-bold tracking-widest uppercase text-[#0c0c14]">{step.label}</h3>
                  <p className="font-mono text-xs text-[#0c0c14]/60 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Labels explained (Dark) — always visible unless report is showing ── */}
      {!jobId && (
        <section className="section-dark border-t border-[rgba(255,255,255,0.12)] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="font-mono text-[10px] text-[#2dd4bf] tracking-widest mb-14 flex items-center gap-2 font-bold">
              <Shield className="w-4 h-4" />
              <span>WHAT THE LABELS MEAN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                ["DOCUMENTED",   CheckCircle,  "The claim is supported by peer-reviewed research, primary measurements, or official institutional records that can be retrieved and checked."],
                ["CONTESTED",    AlertTriangle,"Real scientific or institutional disagreement exists. This is not a fringe objection — credible sources are on both sides."],
                ["SPECULATIVE",  HelpCircle,   "The claim goes beyond what current evidence directly supports. It may be plausible, but it has not been documented by primary sources."],
                ["REFUTED",      XCircle,      "The claim is contradicted by strong, documented evidence. Counter-sources are provided."],
                ["UNVERIFIABLE", Minus,        "No retrievable source could be found to confirm or contradict the claim. Absence of evidence is itself noted, not hidden."],
              ] as const).map(([label, Icon, desc]) => {
                const cfg = LABEL_CONFIG[label as ClaimLabel];
                return (
                  <TiltCard key={label} maxDeg={4}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className={`border ${cfg.darkBorder} ${cfg.darkBg} p-6 h-full`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className={`w-4 h-4 ${cfg.darkColor}`} />
                        <span className={`font-mono text-[9px] tracking-widest font-bold uppercase ${cfg.darkColor}`}>{label}</span>
                      </div>
                      <p className="font-mono text-xs text-white/55 leading-relaxed">{desc}</p>
                    </motion.div>
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="section-dark py-10 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[10px] tracking-widest text-[rgba(255,255,255,0.4)] font-bold">
            AXIOM<span className="text-[#22d3ee]">.SYS</span> v2.0 · DVE
          </div>
          <div className="font-mono text-[10px] text-[#c084fc] font-bold tracking-widest uppercase">
            Patent 64/032,339 & 64/047,737 Pending · DarkWave Studios LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
