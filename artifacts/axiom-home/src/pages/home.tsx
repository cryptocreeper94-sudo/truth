import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Shield, Cpu, FileText, Crosshair, ChevronRight, Activity, Lock, Database, ImageIcon } from "lucide-react";
import heroBgPath from "@assets/generated_images/hero-bg.jpg";
import dataDocPath from "@assets/generated_images/data-doc.jpg";
import featureAnalysisPath from "@assets/generated_images/feature-analysis.jpg";

function useTilt(ref: React.RefObject<HTMLElement | null>, maxDeg = 8) {
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
      el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)'; 
      el.style.transition = 'transform 0.5s ease-out';
      setTimeout(() => { if(el) el.style.transition = ''; }, 500);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { 
      el.removeEventListener('mousemove', onMove); 
      el.removeEventListener('mouseleave', onLeave); 
    };
  }, [maxDeg, ref]);
}

const TiltCard = ({ children, className = "", maxDeg = 8 }: { children: React.ReactNode, className?: string, maxDeg?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, maxDeg);
  return (
    <div ref={ref} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c0c14] overflow-hidden selection:bg-[#22d3ee]/30">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.12)] bg-[#0c0c14]/80 backdrop-blur-md text-[#f0f0f8]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#22d3ee]" />
            <span className="font-mono text-sm tracking-widest font-bold">AXIOM<span className="text-[#22d3ee]">.SYS</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-5">
              <a href="/api/demo/compose.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Compose</a>
              <a href="/api/demo/index.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Chat</a>
              <a href="/api/demo/image.html" className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Images</a>
              <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/verify`} className="font-mono text-[11px] tracking-widest text-[rgba(255,255,255,0.55)] hover:text-[#22d3ee] transition-colors uppercase">Verify</a>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[rgba(26,26,46,0.80)] rounded-sm border border-[rgba(255,255,255,0.12)]">
              <div className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse" />
              <span className="font-mono text-[10px] text-[rgba(255,255,255,0.60)]">SECURE CONNECTION</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section (Dark) */}
      <section className="section-dark min-h-[100dvh] flex items-center pt-14">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgPath} 
            alt="Intelligence interface abstract" 
            className="w-full h-full object-cover opacity-30 hover-color-img"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c14] via-transparent to-[#0c0c14]/50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-start relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-2 mb-6">
              <Terminal className="w-4 h-4 text-[#22d3ee]" />
              <span className="font-mono text-[10px] tracking-widest text-[#22d3ee] uppercase font-bold">Authorization Accepted</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] mb-6 tracking-tight">
              PRECISION <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#c084fc]">WRITING INTELLIGENCE.</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-[rgba(255,255,255,0.78)] max-w-2xl mb-10 leading-relaxed font-mono">
              For professionals who move policy, careers, and public opinion. 
              Imprecise language is a liability. Command the narrative.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/api/demo/compose.html" 
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#22d3ee] text-[#0c0c14] font-mono text-sm font-bold tracking-wider hover:bg-[#2dd4bf] transition-all"
              >
                OPEN DOCUMENT COMPOSER
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a 
                href="/api/demo/index.html" 
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[#f0f0f8] hover:text-[#22d3ee] font-mono text-sm font-bold tracking-wider border border-[rgba(255,255,255,0.2)] hover:border-[#22d3ee] transition-all"
              >
                OPEN CHAT
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Manifesto Section (Crème) */}
      <section className="section-creme py-32 border-t border-[rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="font-mono text-[10px] text-[#c084fc] tracking-widest mb-4 flex items-center gap-2 font-bold">
                <Crosshair className="w-4 h-4" />
                <span>OPERATIONAL DIRECTIVE</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 leading-[0.95] tracking-tight text-[#0c0c14]">
                NOT A WRITING ASSISTANT. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#c084fc]">A COMMAND-GRADE TOOL.</span>
              </h2>
              <div className="space-y-6 text-[#0c0c14]/80 text-lg font-mono">
                <p>
                  Axiom knows the difference between a floor statement and a press release. 
                  It understands the distinction between algorithmic ATS scoring and real editorial judgment.
                </p>
                <p>
                  Using Axiom feels like being handed a classified brief that has already been edited by the best writer in the room. No fluff. No corporate platitudes. Just impact.
                </p>
              </div>
            </motion.div>
            <TiltCard maxDeg={5}>
              <div className="relative aspect-square md:aspect-[4/3] glass-panel p-2 shadow-2xl">
                <img 
                  src={dataDocPath} 
                  alt="Document data analysis"
                  className="w-full h-full object-cover hover-color-img"
                />
                <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 z-20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[10px] text-[#0c0c14]/60 font-bold">SCANNING_MODULE_01</span>
                    <span className="font-mono text-[10px] text-[#2dd4bf] font-bold">ONLINE</span>
                  </div>
                  <div className="h-1 w-full bg-[rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="h-full bg-[#2dd4bf] w-2/3 animate-pulse" />
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* 3. Features Grid (Dark) */}
      <section className="section-dark py-32 border-t border-[rgba(255,255,255,0.12)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="font-mono text-[10px] text-[#2dd4bf] tracking-widest mb-16 flex items-center gap-2 font-bold">
            <Database className="w-4 h-4" />
            <span>SYSTEM CAPABILITIES</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "ATS SCORING & EDITORIAL JUDGMENT",
                desc: "Analyzes resumes and briefs against real-world filtering algorithms. Structures your narrative for maximum human and machine resonance.",
                href: "/api/demo/compose.html"
              },
              {
                icon: FileText,
                title: "CONTEXT-AWARE DOCUMENT COMPOSER",
                desc: "A press release is not a memo. A floor speech is not a tweet. Axiom adapts syntax, tone, and structure to match the medium and audience perfectly.",
                href: "/api/demo/compose.html"
              },
              {
                icon: ImageIcon,
                title: "AI IMAGE GENERATION",
                desc: "Generate high-fidelity visuals on demand. Produce professional imagery for presentations, reports, and social assets without leaving the platform.",
                href: "/api/demo/image.html"
              },
              {
                icon: Lock,
                title: "CLASSIFIED-GRADE PRECISION",
                desc: "Every surface designed to be read under pressure. No distracting UI elements. Just cold, precise, and purposeful output.",
                href: null
              }
            ].map((feature, i) => (
              <TiltCard key={i} maxDeg={6}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-panel p-8 h-full transition-colors hover:border-[#22d3ee]/50 flex flex-col"
                >
                  <feature.icon className="w-8 h-8 text-[#22d3ee] mb-6" />
                  <h3 className="font-mono text-xs font-bold tracking-widest mb-4 uppercase text-[#f0f0f8]">{feature.title}</h3>
                  <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed font-mono flex-1">{feature.desc}</p>
                  {feature.href && (
                    <a href={feature.href} className="mt-6 inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-[#22d3ee] hover:text-[#2dd4bf] transition-colors uppercase font-bold">
                      Launch <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Dashboard Visual (Crème) */}
      <section className="section-creme py-32 border-t border-[rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none mix-blend-multiply z-0">
           <img 
            src={featureAnalysisPath} 
            alt="Feature dashboard" 
            className="w-full h-full object-cover hover-color-img"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl glass-panel p-10 shadow-2xl"
          >
            <Cpu className="w-10 h-10 text-[#c084fc] mb-6" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-[#0c0c14] leading-[0.95]">
              AN OPERATIONS CENTER <br/>FOR YOUR WORDS
            </h2>
            <p className="text-[#0c0c14]/80 font-mono text-sm leading-relaxed mb-8">
              Stop guessing. Start executing. Get immediate feedback on tone, structure, and impact before you hit send. The dashboard analyzes sentiment, verb strength, and passive voice density in real time.
            </p>
            <div className="space-y-3 font-mono text-[10px] tracking-widest font-bold">
              <div className="flex justify-between border-b border-[rgba(0,0,0,0.1)] pb-2">
                <span className="text-[#0c0c14]/60">ACTION VERB DENSITY</span>
                <span className="text-[#fb7185]">OPTIMIZING...</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(0,0,0,0.1)] pb-2">
                <span className="text-[#0c0c14]/60">CLARITY INDEX</span>
                <span className="text-[#2dd4bf]">94.2%</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-[#0c0c14]/60">STRUCTURAL INTEGRITY</span>
                <span className="text-[#2dd4bf]">VERIFIED</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Final CTA (Dark) */}
      <section className="section-dark py-32 border-t border-[rgba(255,255,255,0.12)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Terminal className="w-8 h-8 text-[#fb7185] mx-auto mb-8" />
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-[0.95]">
            READY TO DEPLOY?
          </h2>
          <p className="font-mono text-[rgba(255,255,255,0.5)] text-sm mb-12 tracking-wide">Select your operation.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/api/demo/compose.html" 
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#22d3ee] text-[#0c0c14] font-mono text-sm font-bold tracking-wider hover:bg-[#2dd4bf] transition-all"
            >
              <FileText className="w-4 h-4" />
              DOCUMENT COMPOSER
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/api/demo/index.html" 
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[#f0f0f8] hover:text-[#22d3ee] font-mono text-sm font-bold tracking-wider border border-[rgba(255,255,255,0.2)] hover:border-[#22d3ee] transition-all"
            >
              <Terminal className="w-4 h-4" />
              CHAT INTERFACE
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/api/demo/image.html"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[#f0f0f8] hover:text-[#c084fc] font-mono text-sm font-bold tracking-wider border border-[rgba(255,255,255,0.2)] hover:border-[#c084fc] transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              IMAGE GENERATION
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer (Dark) */}
      <footer className="section-dark py-10 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[10px] tracking-widest text-[rgba(255,255,255,0.4)] font-bold">
            AXIOM<span className="text-[#22d3ee]">.SYS</span> v2.0
          </div>
          <div className="font-mono text-[10px] text-[#c084fc] font-bold tracking-widest uppercase">
            Patent 64/032,339 & 64/047,737 Pending · DarkWave Studios LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
