import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Terminal, Shield, Cpu, FileText, Crosshair, ChevronRight, Activity, Lock, Database, Briefcase, Users, Landmark, Scale } from "lucide-react";

import heroBgPath from "@assets/generated_images/hero-bg.jpg";
import dataDocPath from "@assets/generated_images/data-doc.jpg";
import featureAnalysisPath from "@assets/generated_images/feature-analysis.jpg";

export default function Home() {
  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-hidden">
      {/* Fixed Noise Overlay for texture */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm tracking-widest font-bold">AXIOM<span className="text-primary">.SYS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-md border border-border">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">SECURE CONNECTION</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-14">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgPath} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-start">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs tracking-widest text-primary uppercase">Authorization Accepted</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
              PRECISION <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">WRITING INTELLIGENCE.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              For professionals who move policy, careers, and public opinion. 
              Congress, communications, and executive strategy. Imprecise language is a liability.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/api/demo/compose.html" 
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-mono text-sm font-bold tracking-wider hover:bg-primary/90 transition-all border-glow"
              >
                OPEN DOCUMENT COMPOSER
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 border border-primary/50 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
              </a>
              
              <a 
                href="/api/demo/index.html" 
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground hover:text-primary font-mono text-sm font-bold tracking-wider border border-border hover:border-primary/50 transition-all"
              >
                OPEN CHAT INTERFACE
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Manifesto / Value Prop */}
      <section className="py-32 relative border-t border-border/50 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <div className="font-mono text-xs text-primary tracking-widest mb-4 flex items-center gap-2">
                <Crosshair className="w-4 h-4" />
                <span>OPERATIONAL DIRECTIVE</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                Not a writing assistant.<br/>
                A <span className="text-primary">command-grade</span> tool.
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg">
                <p>
                  Axiom knows the difference between a floor statement and a press release. 
                  It understands the distinction between algorithmic ATS scoring and real editorial judgment.
                </p>
                <p>
                  Every surface, every feature, every interaction is designed to be read under pressure, not admired over coffee.
                </p>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/3] rounded-sm border border-border overflow-hidden bg-secondary">
              <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10" />
              <img 
                src={dataDocPath} 
                alt="Abstract document data"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur border border-border p-4 rounded-sm z-20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-muted-foreground">SCANNING_MODULE_01</span>
                  <span className="font-mono text-xs text-primary">ONLINE</span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="font-mono text-xs text-primary tracking-widest mb-12 flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>SYSTEM CAPABILITIES</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "ATS SCORING & EDITORIAL JUDGMENT",
                desc: "Analyzes resumes and briefs against real-world filtering algorithms. Doesn't just find keywords—structures your narrative for maximum human and machine resonance."
              },
              {
                icon: FileText,
                title: "CONTEXT-AWARE ADAPTATION",
                desc: "A press release is not a memo. A floor speech is not a tweet. Axiom adjusts syntax, tone, and structure to perfectly match the medium and audience."
              },
              {
                icon: Lock,
                title: "CLASSIFIED-GRADE PRECISION",
                desc: "Every surface designed to be read under pressure. No distracting UI elements. Just cold, precise, and purposeful output."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-primary mb-6" />
                <h3 className="font-mono text-sm font-bold tracking-widest mb-4">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Target Profiles */}
      <section className="py-24 relative border-t border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
                Designed for those who <span className="text-primary">cannot afford</span> imprecise language.
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Congressional Staff", icon: Landmark, desc: "Drafting floor statements and policy memos with zero margin for error." },
                  { title: "Communications Directors", icon: Users, desc: "Navigating public opinion and shaping the narrative under extreme deadlines." },
                  { title: "Policy Analysts", icon: Scale, desc: "Translating complex legislative jargon into actionable, clear executive summaries." },
                  { title: "Senior Job Seekers", icon: Briefcase, desc: "Bypassing automated ATS filters with resumes that command human attention." }
                ].map((profile, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 border border-transparent hover:border-border hover:bg-secondary/20 rounded-sm transition-all"
                  >
                    <div className="p-3 bg-secondary rounded-sm">
                      <profile.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{profile.title}</h4>
                      <p className="text-sm text-muted-foreground">{profile.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl opacity-50 z-0"></div>
              <div className="relative z-10 bg-secondary/80 backdrop-blur-xl border border-border p-8 rounded-sm shadow-2xl">
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="space-y-4 font-mono text-xs md:text-sm text-muted-foreground">
                  <p><span className="text-primary">{'>'}</span> ANALYZING TARGET AUDIENCE...</p>
                  <p><span className="text-primary">{'>'}</span> OPTIMIZING FOR IMMEDIATE IMPACT.</p>
                  <p><span className="text-primary">{'>'}</span> ATS SCORE TRAJECTORY: <span className="text-green-400">92% (+14%)</span></p>
                  <p className="pt-4 border-t border-border/50 text-foreground">
                    "The candidate's executive summary now correctly maps to the required competencies for a Director of Policy role, bypassing the initial heuristic filter."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Briefing (Testimonial / Vibe) */}
      <section className="py-32 relative border-t border-border/50 bg-secondary/10 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Crosshair className="w-10 h-10 text-primary mx-auto mb-8 opacity-50" />
            <blockquote className="text-2xl md:text-4xl font-serif italic text-muted-foreground leading-relaxed mb-8">
              "Feels like being handed a classified brief that has already been edited by the best writer in the room."
            </blockquote>
            <div className="font-mono text-sm font-bold tracking-widest text-primary uppercase">
              // USER REPORT 04-A
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Full Width Tech Visual */}
      <section className="py-24 relative overflow-hidden bg-black border-y border-primary/20">
        <div className="absolute inset-0 z-0">
          <img 
            src={featureAnalysisPath} 
            alt="Intelligence Dashboard" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-block p-8 border border-primary/30 bg-background/80 backdrop-blur-md"
          >
            <Cpu className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4 text-glow">
              AN OPERATIONS CENTER FOR YOUR WORDS
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-mono text-sm">
              Stop guessing. Start executing. Get immediate feedback on tone, structure, and impact before you hit send.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Terminal className="w-8 h-8 text-primary mx-auto mb-6" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
            READY TO DEPLOY?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/api/demo/compose.html" 
              className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-mono text-sm font-bold tracking-wider hover:bg-primary/90 transition-all border-glow"
            >
              INITIALIZE COMPOSER SESSION
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/api/demo/index.html" 
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-secondary text-secondary-foreground hover:text-primary font-mono text-sm font-bold tracking-wider border border-border hover:border-primary/50 transition-all"
            >
              OPEN CHAT INTERFACE
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-xs tracking-widest text-muted-foreground">
            AXIOM<span className="text-primary">.SYS</span> v2.0
          </div>
          <div className="font-mono text-[10px] text-muted-foreground text-center md:text-right uppercase tracking-widest">
            Patent 64/032,339 & 64/047,737 Pending · DarkWave Studios LLC
          </div>
        </div>
      </footer>
    </div>
  );
}
