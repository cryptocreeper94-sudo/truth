import { motion } from 'framer-motion';
import { ExternalLink, Share2, Copy, FileText, PlayCircle, Loader2 } from 'lucide-react';
import type { VerifyJob } from '@workspace/api-client-react';

const LABEL_CONFIG = {
  documented: { bg: 'bg-[#2dd4bf]', text: 'text-[#0c0c14]', label: 'DOCUMENTED' },
  contested: { bg: 'bg-[#fbbf24]', text: 'text-[#0c0c14]', label: 'CONTESTED' },
  speculative: { bg: 'bg-[#c084fc]', text: 'text-[#0c0c14]', label: 'SPECULATIVE' },
  refuted: { bg: 'bg-[#fb7185]', text: 'text-[#0c0c14]', label: 'REFUTED' },
  unverifiable: { bg: 'bg-[rgba(255,255,255,0.15)]', text: 'text-[#f0f0f8]', label: 'UNVERIFIABLE' },
};

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Report({ 
  job, 
  onShare, 
  isSharing, 
  sharedUrl, 
  onReset 
}: { 
  job: VerifyJob, 
  onShare?: () => void, 
  isSharing?: boolean, 
  sharedUrl?: string | null,
  onReset?: () => void 
}) {
  const claims = job.claims || [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      
      {/* Video Context */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        {job.video_thumbnail && (
          <div className="w-full md:w-64 aspect-video shrink-0 bg-black relative border border-[rgba(255,255,255,0.1)] group overflow-hidden">
            <img src={job.video_thumbnail} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#22d3ee] uppercase font-bold">
                <PlayCircle className="w-3 h-3" />
                {job.platform || "Source"}
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur text-white font-mono text-[10px] px-2 py-1">
              {formatDuration(job.duration_seconds)}
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="font-mono text-[10px] tracking-widest text-[#c084fc] font-bold uppercase mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            VERIFICATION REPORT
          </div>
          <h2 className="font-sans text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 leading-tight">
            {job.video_title || "Unknown Subject"}
          </h2>
          {job.summary && (
            <p data-testid="text-summary" className="font-mono text-sm text-[rgba(255,255,255,0.8)] leading-relaxed border-l-2 border-l-[#22d3ee] pl-4">
              {job.summary}
            </p>
          )}
        </div>
      </motion.div>

      {/* Claims */}
      <div className="space-y-6">
        <h3 className="font-mono text-xs tracking-widest text-[rgba(255,255,255,0.5)] uppercase font-bold pl-2 border-l border-[rgba(255,255,255,0.1)]">
          Analyzed Claims ({claims.length})
        </h3>
        
        {claims.map((claim, idx) => {
          const cfg = LABEL_CONFIG[claim.label] || LABEL_CONFIG.unverifiable;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              data-testid={`card-claim-${claim.number}`}
              className="glass-panel flex flex-col md:flex-row overflow-hidden"
            >
              {/* Claim Number / Badge Area */}
              <div className="md:w-48 shrink-0 bg-[rgba(0,0,0,0.3)] border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.05)] p-6 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start gap-4">
                <div className="font-mono text-[10px] tracking-widest text-[rgba(255,255,255,0.4)]">
                  CLAIM {String(claim.number).padStart(2, '0')}
                </div>
                <div data-testid={`badge-label-${claim.number}`} className={`font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </div>
              </div>

              {/* Claim Content */}
              <div className="p-6 md:p-8 flex-1">
                <p className="font-sans text-lg md:text-xl font-bold text-[#f0f0f8] mb-4 leading-snug">
                  "{claim.text}"
                </p>
                <div className="font-mono text-sm text-[rgba(255,255,255,0.7)] leading-relaxed mb-6">
                  {claim.rationale}
                </div>

                {(claim.established || claim.not_established) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {claim.established && (
                      <div className="bg-[rgba(45,212,191,0.05)] border border-[#2dd4bf]/20 p-4">
                        <div className="font-mono text-[10px] text-[#2dd4bf] tracking-widest font-bold mb-2 uppercase">What's Established</div>
                        <div className="font-mono text-xs text-[rgba(255,255,255,0.8)] leading-relaxed">{claim.established}</div>
                      </div>
                    )}
                    {claim.not_established && (
                      <div className="bg-[rgba(251,113,133,0.05)] border border-[#fb7185]/20 p-4">
                        <div className="font-mono text-[10px] text-[#fb7185] tracking-widest font-bold mb-2 uppercase">What's Not</div>
                        <div className="font-mono text-xs text-[rgba(255,255,255,0.8)] leading-relaxed">{claim.not_established}</div>
                      </div>
                    )}
                  </div>
                )}

                {claim.sources && claim.sources.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="font-mono text-[10px] tracking-widest text-[rgba(255,255,255,0.4)] mb-3 uppercase">Sources</div>
                    <div className="flex flex-col gap-2">
                      {claim.sources.map((src, sIdx) => (
                        <a 
                          key={sIdx} 
                          href={src.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid={`link-source-${claim.number}-${sIdx}`}
                          className="group inline-flex items-center gap-2 font-mono text-xs text-[rgba(255,255,255,0.6)] hover:text-[#22d3ee] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                          <span className="truncate">{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-12 border-t border-[rgba(255,255,255,0.1)] pt-8">
        {onReset ? (
          <button 
            onClick={onReset}
            className="font-mono text-xs text-[rgba(255,255,255,0.5)] hover:text-[#f0f0f8] uppercase tracking-widest transition-colors cursor-pointer"
          >
            Verify Another Subject
          </button>
        ) : (
          <div /> // spacer
        )}
        
        {onShare && (
          <div className="flex items-center gap-4">
            {sharedUrl ? (
              <div className="flex items-center gap-2 bg-[rgba(0,0,0,0.5)] border border-[#2dd4bf]/30 p-1 pl-4">
                <span className="font-mono text-xs text-[#2dd4bf] truncate max-w-[200px]" data-testid="text-share-url">{sharedUrl}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(sharedUrl)}
                  className="p-2 bg-[#2dd4bf] text-[#0c0c14] hover:bg-white transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onShare}
                disabled={isSharing}
                data-testid="button-share"
                className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[#f0f0f8] hover:border-[#c084fc] hover:text-[#c084fc] px-6 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                SHARE REPORT
              </button>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}
