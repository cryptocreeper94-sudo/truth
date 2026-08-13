import { Activity } from 'lucide-react';
import { Link } from 'wouter';

export function TopNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.12)] bg-[#0c0c14]/80 backdrop-blur-md text-[#f0f0f8]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#22d3ee]" />
          <span className="font-mono text-sm tracking-widest font-bold">AXIOM<span className="text-[#22d3ee]">.SYS</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5">
            <Link href="/verify" className="font-mono text-[11px] tracking-widest text-[#22d3ee] transition-colors uppercase font-bold">Verify</Link>
            <a href="/api/demo/compose.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Compose</a>
            <a href="/api/demo/index.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Chat</a>
            <a href="/api/demo/image.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Images</a>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[rgba(26,26,46,0.80)] rounded-sm border border-[rgba(255,255,255,0.12)]">
            <div className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
            <span className="font-mono text-[10px] text-[rgba(255,255,255,0.60)]">SECURE CONNECTION</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
