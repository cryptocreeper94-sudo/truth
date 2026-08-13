import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubmitVerifyJob, useGetVerifyJob, getGetVerifyJobQueryKey, useShareVerifyJob } from '@workspace/api-client-react';
import { Shield, Loader2, RefreshCcw } from 'lucide-react';
import { Report } from '@/components/verify/report';
import { TopNav } from '@/components/verify/top-nav';

export default function Verify() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  
  const submitJob = useSubmitVerifyJob();
  const { data: job } = useGetVerifyJob(jobId || '', {
    query: {
      enabled: !!jobId,
      queryKey: getGetVerifyJobQueryKey(jobId || ''),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === 'done' || status === 'failed' ? false : 2000;
      }
    }
  });

  const shareJob = useShareVerifyJob();
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);

  const handleShare = () => {
    if (!jobId) return;
    shareJob.mutate({ jobId }, {
      onSuccess: (data) => {
        const finalUrl = data.url.startsWith('http') ? data.url : `${window.location.origin}/verify/share/${data.slug}`;
        setSharedUrl(finalUrl);
      }
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    submitJob.mutate({ data: { url } }, {
      onSuccess: (data) => setJobId(data.job_id)
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#0c0c14] text-[#f0f0f8] selection:bg-[#22d3ee]/30 flex flex-col">
      <TopNav />
      <main className="flex-1 flex flex-col items-center justify-center p-6 section-dark pt-24 pb-20">
        
        {!jobId && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl glass-panel p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6 text-[#22d3ee]">
              <Shield className="w-6 h-6" />
              <h1 className="font-sans text-3xl font-black uppercase tracking-tight">Verify Video</h1>
            </div>
            <p className="font-mono text-[rgba(255,255,255,0.7)] text-sm leading-relaxed mb-8">
              Axiom acts as a deterministic verification engine. Submit a public video URL, and the system will extract every factual claim, analyze it against documented evidence, and deliver an honest, precise verdict. It never pretends to know more than it does.
            </p>
            
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] tracking-widest text-[#22d3ee] font-bold uppercase">Target URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    data-testid="input-url"
                    required
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] focus:border-[#22d3ee] outline-none px-4 py-3 font-mono text-sm text-[#f0f0f8] placeholder:text-[rgba(255,255,255,0.3)] transition-colors w-full"
                  />
                  <button 
                    type="submit" 
                    data-testid="button-verify"
                    disabled={submitJob.isPending}
                    className="bg-[#22d3ee] text-[#0c0c14] px-8 py-3 font-mono text-sm font-bold tracking-wider hover:bg-[#2dd4bf] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    {submitJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE"}
                  </button>
                </div>
              </div>
              {submitJob.error && (
                <div data-testid="text-error" className="mt-4 bg-[rgba(251,113,133,0.1)] border border-[#fb7185]/30 text-[#fb7185] px-4 py-3 font-mono text-xs">
                  {(submitJob.error as { error?: string } | null)?.error || "An error occurred"}
                </div>
              )}
            </form>
          </motion.div>
        )}

        {jobId && job?.status && job.status !== 'done' && job.status !== 'failed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xl glass-panel p-8">
            <div className="flex flex-col items-center text-center">
              <RefreshCcw className="w-8 h-8 text-[#c084fc] animate-spin mb-6" />
              <h2 className="font-sans text-2xl font-black uppercase tracking-tight mb-2">Analyzing Subject</h2>
              <p className="font-mono text-[rgba(255,255,255,0.5)] text-xs mb-8">This process requires precision. For longer subjects, it may take a few minutes.</p>
              
              <div className="w-full space-y-2">
                <div className="flex justify-between font-mono text-[10px] font-bold tracking-widest uppercase">
                  <span className="text-[#2dd4bf]" data-testid="status-progress">{job.step_label || 'INITIALIZING'}</span>
                  <span className="text-[rgba(255,255,255,0.5)]">{Math.round(job.progress)}%</span>
                </div>
                <div className="h-1 w-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#2dd4bf]" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${job.progress}%` }} 
                    transition={{ ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {job?.status === 'failed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl glass-panel p-8 border-l-4 border-l-[#fb7185]">
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight mb-4 text-[#fb7185]">Analysis Failed</h2>
            <p data-testid="text-error" className="font-mono text-sm text-[rgba(255,255,255,0.8)] mb-8 bg-[rgba(0,0,0,0.5)] p-4 border border-[rgba(255,255,255,0.05)]">
              {job.error_message || "System encountered an unknown anomaly."}
            </p>
            <button 
              onClick={() => {
                setJobId(null);
                setUrl('');
                submitJob.reset();
              }}
              className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[#f0f0f8] hover:border-[#22d3ee] hover:text-[#22d3ee] px-6 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
            >
              Analyze New Subject
            </button>
          </motion.div>
        )}

        {job?.status === 'done' && (
          <Report 
            job={job} 
            onShare={handleShare} 
            isSharing={shareJob.isPending} 
            sharedUrl={sharedUrl} 
            onReset={() => {
              setJobId(null);
              setUrl('');
              setSharedUrl(null);
              submitJob.reset();
              shareJob.reset();
            }}
          />
        )}
      </main>
    </div>
  );
}
