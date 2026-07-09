"use client";

import { motion } from "framer-motion";
import { Code2, Bot, Briefcase, Zap, ChevronRight, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function Home() {
  const features = [
    {
      icon: <Bot size={28} className="text-purple-400" />,
      title: "AI Mentor 24/7",
      desc: "Get instant explanations and real-time fixes for your code errors.",
      colSpan: "md:col-span-2",
      bgClass: "bg-gradient-to-br from-purple-900/40 to-slate-900/60",
    },
    {
      icon: <Code2 size={28} className="text-cyan-400" />,
      title: "Real Projects",
      desc: "Build industry-standard real projects instead of small exercises.",
      colSpan: "md:col-span-1",
      bgClass: "bg-slate-900/50",
    },
    {
      icon: <Briefcase size={28} className="text-emerald-400" />,
      title: "Auto Portfolio",
      desc: "Automatically build your professional portfolio as you complete work.",
      colSpan: "md:col-span-1",
      bgClass: "bg-slate-900/50",
    },
    {
      icon: <Zap size={28} className="text-amber-400" />,
      title: "Live Challenges",
      desc: "Test your skills in real-time with live competitive coding challenges.",
      colSpan: "md:col-span-1",
      bgClass: "bg-slate-900/50",
    },
    {
      icon: <Globe size={28} className="text-pink-400" />,
      title: "Real-World Experience",
      desc: "Gain hands-on experience by solving real-world problems for tech companies.",
      colSpan: "md:col-span-1",
      bgClass: "bg-slate-900/50",
    },
  ];

  return (
    <main className="bg-[#020617] selection:bg-purple-500/30 overflow-hidden relative font-sans">
      
      {/* Background Orbs & Ambient Light */}
      <div 
        className="absolute inset-0 w-full h-[150vh] pointer-events-none z-0" 
        style={{
          background: `
            radial-gradient(circle at 15% 10%, rgba(147, 51, 234, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 90% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 45%)
          `
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto z-10 flex flex-col lg:flex-row items-center gap-12 min-h-[90vh]">
        
        {/* Left Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex-1 w-full text-center lg:text-left pt-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md text-sm text-purple-300 font-medium tracking-wide mb-8 shadow-inner">
            <Sparkles size={16} className="text-cyan-400" />
            The Future of Programming Education
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
            Build Real Projects with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 drop-shadow-sm">
              AI Mentorship
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
            Learn by doing, not just theory. Build real-world projects with instant AI assistance and automatically generate your professional portfolio as you code.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-[15px] font-bold text-white bg-purple-600 rounded-full overflow-hidden transition-all hover:scale-[1.02] hover:bg-purple-500 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]"
            >
              <span>Get Started Free</span>
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 text-[15px] font-bold text-white bg-white/[0.03] border border-white/[0.1] rounded-full hover:bg-white/[0.08] backdrop-blur-md transition-all"
            >
              Explore Features
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Abstract Image Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex-1 w-full relative hidden lg:block"
        >
          <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border border-white/[0.1] shadow-2xl bg-black/40 backdrop-blur-3xl p-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 mix-blend-overlay z-10" />
            <Image 
              src="/hero-bg.png" 
              alt="Premium 3D Abstract AI Code Environment" 
              fill
              className="object-cover rounded-[2.5rem] opacity-90 hover:scale-105 transition-transform duration-1000 ease-out"
              priority
            />
          </div>
          {/* Floating UI Elements over Image */}
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -left-10 top-1/4 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl shadow-2xl flex items-center gap-3 z-20"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Code2 size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Review</p>
              <p className="text-sm font-bold text-white">0 Errors Found</p>
            </div>
          </motion.div>
        </motion.div>

      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10 mt-10 min-h-screen">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs text-purple-300 font-bold tracking-widest uppercase mb-4"
          >
            Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-white"
          >
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Succeed</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto text-lg"
          >
            All the tools you need to become industry-ready, seamlessly integrated into one platform.
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className={`p-8 rounded-[2rem] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 backdrop-blur-xl group relative overflow-hidden ${feature.colSpan} ${feature.bgClass}`}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-inner flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light text-[15px]">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}