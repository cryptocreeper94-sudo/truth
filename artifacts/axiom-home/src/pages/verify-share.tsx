import { useParams, Link } from 'wouter';
import { useGetSharedVerifyReport, getGetSharedVerifyReportQueryKey } from '@workspace/api-client-react';
import { TopNav } from '@/components/verify/top-nav';
import { Report } from '@/components/verify/report';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyShare() {
  const params = useParams();
  const slug = params.slug;

  const { data: job, isLoading, error } = useGetSharedVerifyReport(slug || '', {
    query: {
      enabled: !!slug,
      queryKey: getGetSharedVerifyReportQueryKey(slug || ''),
      retry: false
    }
  });

  return (
    <div className="min-h-[100dvh] bg-[#0c0c14] text-[#f0f0f8] selection:bg-[#22d3ee]/30 flex flex-col">
      <TopNav />
      <main className="flex-1 flex flex-col items-center justify-center p-6 section-dark pt-24 pb-20">
        {isLoading && (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#22d3ee] animate-spin mb-4" />
            <div className="font-mono text-xs tracking-widest text-[rgba(255,255,255,0.5)] uppercase">Retrieving Report...</div>
          </div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xl glass-panel p-8 text-center">
            <Shield className="w-12 h-12 text-[#fb7185] mx-auto mb-6 opacity-50" />
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight mb-4">Report Not Found</h2>
            <p className="font-mono text-[rgba(255,255,255,0.6)] text-sm mb-8">
              This verification report could not be found or has expired.
            </p>
            <Link 
              href="/verify" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#22d3ee] text-[#0c0c14] font-mono text-xs font-bold tracking-wider hover:bg-[#2dd4bf] transition-all"
            >
              VERIFY YOUR OWN VIDEO
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {job && (
          <div className="w-full max-w-4xl space-y-8">
            <div className="bg-[rgba(34,211,238,0.05)] border border-[#22d3ee]/20 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="font-mono text-xs text-[rgba(255,255,255,0.7)]">
                You are viewing a shared verification report.
              </div>
              <Link 
                href="/verify" 
                className="font-mono text-[10px] tracking-widest text-[#22d3ee] font-bold uppercase hover:text-[#2dd4bf] transition-colors flex items-center gap-1"
              >
                Verify a video <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            <Report job={job} />
          </div>
        )}
      </main>
    </div>
  );
}
