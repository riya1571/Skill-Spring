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
        setProjects(data);
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
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            Real-World Projects
          </h1>
          <p className="text-slate-400 text-lg">
            শুধু থিওরি নয়, বাস্তব সমস্যা সমাধান করে শিখুন। আপনার পছন্দের প্রজেক্টটি বেছে নিন।
          </p>
        </motion.div>
      </header>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
          <p className="text-slate-500">No projects available yet. Did you run the seed script?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Code2 size={24} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter border ${
                  project.difficulty === 'Beginner' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5'
                }`}>
                  {project.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {project.tags?.map(tag => (
                  <span key={tag} className="text-[10px] uppercase font-medium tracking-widest bg-slate-800/50 px-2 py-1 rounded border border-slate-700 text-slate-400 group-hover:border-slate-600 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>

              <Link href={`/projects/${project._id}`} className="block">
                <button className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group/btn">
                  Start Project <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}