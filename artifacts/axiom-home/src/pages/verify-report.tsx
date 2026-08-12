import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import {
  Activity, Terminal, Shield, AlertTriangle, CheckCircle,
  HelpCircle, XCircle, Minus, ExternalLink, ArrowRight, Loader2, ChevronRight
} from "lucide-react";

// ── Types (mirror of verify.tsx) ─────────────────────────────────────────────
type ClaimLabel = "DOCUMENTED" | "CONTESTED" | "SPECULATIVE" | "REFUTED" | "UNVERIFIABLE";

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

const LABEL_CONFIG: Record<ClaimLabel, {
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  DOCUMENTED:   { color: "text-[#2dd4bf]", bg: "bg-[#2dd4bf]/10", border: "border-[#2dd4bf]/30", icon: CheckCircle },
  CONTESTED:    { color: "text-[#fb7185]", bg: "bg-[#fb7185]/10", border: "border-[#fb7185]/30", icon: AlertTriangle },
  SPECULATIVE:  { color: "text-[#c084fc]", bg: "bg-[#c084fc]/10", border: "border-[#c084fc]/30", icon: HelpCircle },
  REFUTED:      { color: "text-[#f97316]", bg: "bg-[#f97316]/10", border: "border-[#f97316]/30", icon: XCircle },
  UNVERIFIABLE: { color: "text-[rgba(240,240,248,0.4)]", bg: "bg-white/5", border: "border-white/10", icon: Minus },
};

function ClaimRow({ claim, index }: { claim: VerifyClaim; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = LABEL_CONFIG[claim.label];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`border ${cfg.border} ${cfg.bg} p-6 cursor-pointer`}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start gap-4">
        <span className="font-mono text-[10px] text-white/30 tracking-widest pt-0.5 min-w-[2ch]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className={`flex items-center gap-1.5 px-2 py-1 border ${cfg.border} ${cfg.bg} shrink-0`}>
          <Icon className={`w-3 h-3 ${cfg.color}`} />
          <span className={`font-mono text-[9px] tracking-widest font-bold uppercase ${cfg.color}`}>
            {claim.label}
          </span>
        </div>
        <p className="text-[#f0f0f8] text-sm leading-relaxed flex-1 font-mono">{claim.text}</p>
        {claim.timecode && (
          <span className="font-mono text-[9px] text-white/30 tracking-widest shrink-0 pt-0.5">{claim.timecode}</span>
        )}
        <ChevronRight className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
      </div>

      {expanded && (
        <div className="mt-5 ml-[calc(2ch+1rem)] pl-4 border-l border-white/10 space-y-4">
          <p className="font-mono text-xs text-white/60 leading-relaxed">{claim.rationale}</p>
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
                  className="flex items-center gap-2 font-mono text-[11px] text-[#22d3ee] hover:text-[#2dd4bf] transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="underline underline-offset-2 decoration-[#22d3ee]/40">{src.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyReport() {
  const [, params] = useRoute("/verify/report/:slug");
  const slug = params?.slug;
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/verify/share/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json() as { result: VerifyResult };
        setResult(data.result);
        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    })();
  }, [slug, BASE]);

  return (
    <div className="min-h-screen bg-[#0c0c14] selection:bg-[#22d3ee]/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.12)] bg-[#0c0c14]/80 backdrop-blur-md text-[#f0f0f8]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#22d3ee]" />
            <a href={`${BASE}/`} className="font-mono text-sm tracking-widest font-bold hover:text-[#22d3ee] transition-colors">
              AXIOM<span className="text-[#22d3ee]">.SYS</span>
            </a>
          </div>
          <a
            href={`${BASE}/verify`}
            className="font-mono text-[11px] tracking-widest text-[#22d3ee] uppercase font-bold hover:text-[#2dd4bf] transition-colors"
          >
            Verify your own video →
          </a>
        </div>
      </nav>

      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#22d3ee] animate-spin" />
        </div>
      )}

      {notFound && !loading && (
        <section className="section-dark min-h-screen flex items-center pt-14">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <AlertTriangle className="w-8 h-8 text-[#fb7185] mx-auto mb-6" />
            <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-[#f0f0f8]">
              Report Not Found
            </h1>
            <p className="font-mono text-sm text-white/50 leading-relaxed mb-8">
              This report may have been removed, or the link may be incorrect.
            </p>
            <a
              href={`${BASE}/verify`}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#22d3ee] text-[#0c0c14] font-mono text-sm font-bold tracking-wider hover:bg-[#2dd4bf] transition-all"
            >
              VERIFY A VIDEO
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      )}

      {result && !loading && (
        <>
          {/* Header (Crème) */}
          <section className="section-creme pt-32 pb-16 border-b border-[rgba(0,0,0,0.1)]">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-center gap-2 mb-8">
                <Shield className="w-4 h-4 text-[#2dd4bf]" />
                <span className="font-mono text-[10px] tracking-widest text-[#2dd4bf] uppercase font-bold">
                  Shared Verification Report
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
                <div>
                  <p className="font-mono text-[9px] tracking-widest text-[#0c0c14]/40 uppercase mb-2">
                    {result.videoPlatform}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#0c0c14] leading-[0.95] mb-6">
                    {result.videoTitle}
                  </h1>
                  <p className="font-mono text-sm text-[#0c0c14]/70 leading-relaxed max-w-2xl">
                    {result.summary}
                  </p>
                </div>

                {result.thumbnailUrl && (
                  <div className="w-full lg:w-64 shrink-0 border border-[rgba(0,0,0,0.1)] overflow-hidden">
                    <img
                      src={result.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full aspect-video object-cover hover-color-img"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Claims (Dark) */}
          <section className="section-dark py-20">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-4 h-4 text-[#c084fc]" />
                <span className="font-mono text-[10px] tracking-widest text-[#c084fc] uppercase font-bold">
                  {result.claims.length} Claims Extracted
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/30 mb-10">
                Click any claim to expand rationale and sources.
              </p>
              <div className="space-y-3">
                {result.claims.map((claim, i) => (
                  <ClaimRow key={claim.id} claim={claim} index={i} />
                ))}
              </div>
            </div>
          </section>
        </>
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
