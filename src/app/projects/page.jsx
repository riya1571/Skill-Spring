"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        
        // যদি রেসপন্স ওকে না থাকে (যেমন ৪০৪ বা ৫০০ এরর)
        if (!res.ok) {
          throw new Error("Failed to fetch projects from server");
        }

        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // লোডিং স্টেট
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-950">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="text-slate-400 animate-pulse">Loading amazing projects...</p>
    </div>
  );

  // এরর স্টেট
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center">
      <AlertCircle className="text-red-500" size={48} />
      <h2 className="text-xl font-bold">Oops! Something went wrong</h2>
      <p className="text-slate-400 max-w-md">{error}. Please make sure your server is running and database is connected.</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">Try Again</button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-10">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <Code2 size={14} /> Level Up Your Skills
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Real-World{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Projects
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
              শুধু থিওরি নয়, বাস্তব সমস্যা সমাধান করে শিখুন। আপনার পছন্দের প্রজেক্টটি বেছে নিন এবং কোডিং শুরু করুন।
            </p>
          </motion.div>
        </header>

        {projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-dashed border-slate-700/50 shadow-2xl"
          >
            <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
              <Code2 className="text-slate-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">Projects will appear here once they are added. Did you run the seed script?</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-1 flex flex-col h-full overflow-hidden shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] transition-all"
              >
                {/* Glowing border effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ zIndex: -1, margin: '-1px' }} />
                
                <div className="bg-slate-950/90 rounded-[22px] p-7 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-purple-400 group-hover:rotate-6 transition-all duration-300 shadow-inner">
                      <Code2 size={24} />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border backdrop-blur-md ${
                      project.difficulty === 'Beginner' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 
                      project.difficulty === 'Intermediate' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                      'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-8 line-clamp-3 flex-grow leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags?.map(tag => (
                      <span key={tag} className="text-[11px] font-medium tracking-wide bg-slate-800/40 px-3 py-1 rounded-lg border border-slate-700/50 text-slate-300 group-hover:border-indigo-500/30 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link href={`/projects/${project._id}`} className="block mt-auto">
                    <button className="relative w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group/btn overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center gap-2">
                        Start Project <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                      </span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}