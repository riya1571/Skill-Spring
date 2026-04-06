"use client";
import React from "react";
import { motion } from "framer-motion";
import { Hammer, ArrowLeft, Construction, Rocket } from "lucide-react";
import Link from "next/link";

const WorkingPage = ({ pageName }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#05070a] flex flex-col items-center justify-center p-6 text-center">
      
      {/* এনিমেটেড আইকন */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8 p-6 bg-blue-500/10 rounded-full border border-blue-500/20"
      >
        <Hammer size={60} className="text-blue-500" />
      </motion.div>

      {/* টেক্সট সেকশন */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-md"
      >
        <h2 className="text-xs font-black text-blue-500 uppercase tracking-[5px] mb-2 flex items-center justify-center gap-2">
          <Construction size={14} /> Work In Progress
        </h2>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">
          Something Exciting <br /> 
          is <span className="text-blue-500">Cooking!</span>
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          জয়াশয়, তুমি যেই <span className="text-blue-400 font-bold">"{pageName || "Feature"}"</span> পেজটি খুঁজছো, সেটির কাজ বর্তমানে ব্যাকএন্ডে চলছে। খুব শীঘ্রই এটি লাইভ হবে!
        </p>
      </motion.div>

      {/* বাটনস */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-col sm:flex-row gap-4"
      >
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition shadow-xl shadow-blue-500/20 uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Go Back Home
        </Link>
        <div className="px-8 py-3 bg-[#161b22] border border-gray-800 text-gray-400 rounded-2xl font-bold text-xs flex items-center gap-2 uppercase tracking-widest">
          <Rocket size={16} /> Stay Tuned
        </div>
      </motion.div>

      {/* ব্যাকগ্রাউন্ড ডেকোরেশন (অপশনাল) */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
    </div>
  );
};

export default WorkingPage;