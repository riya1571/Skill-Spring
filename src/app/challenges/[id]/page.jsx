"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // <-- এটি সবচেয়ে সেফ উপায়
import { ArrowLeft, Play, Loader2, Bot, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

export default function ChallengeWorkspace() {
  const params = useParams();
  const id = params?.id; // useParams থেকে সরাসরি id নিয়ে নিচ্ছি

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // কোড এডিটরের স্টেট
  const [code, setCode] = useState("// Write your solution here...\n");
  
  // AI রিভিউ স্টেট
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${id}`);
        const data = await res.json();
        setChallenge(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleAutoReview = async () => {
    if (!code.trim() || code === "// Write your solution here...\n") {
      setFeedback({ status: "error", text: "দয়া করে আগে এডিটরে আপনার সমাধানের কোডটি লিখুন!" });
      return;
    }

    setIsReviewing(true);
    setFeedback(null);
    
    try {
      const res = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: code,
          challengeTitle: challenge?.title,
          expectedOutput: challenge?.expectedOutput
        }),
      });

      const data = await res.json();
      setFeedback(data);

      if (data.status === "success") {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#ffffff'] });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ status: "error", text: "নেটওয়ার্ক বা সার্ভারে কোনো সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।" });
    } finally {
      setIsReviewing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden relative z-0">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-white/[0.05] flex items-center px-6 justify-between bg-white/[0.02] backdrop-blur-2xl shrink-0 relative z-10">
        <Link href="/challenges" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold tracking-wide">
          <ArrowLeft size={16} /> Back to Challenges
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-yellow-500 font-bold flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 shadow-inner text-xs uppercase tracking-widest">
            <Trophy size={14} /> {challenge?.points} Pts
          </span>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative z-10">
        
        {/* Left Side: Challenge Details */}
        <div className="p-6 md:p-10 border-r border-white/[0.05] overflow-y-auto bg-white/[0.01] backdrop-blur-xl custom-scrollbar">
          <div className="mb-6">
            <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-black border border-purple-500/20 uppercase tracking-widest shadow-inner">
              {challenge?.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">{challenge?.title}</h1>
          <p className="text-slate-300 leading-relaxed mb-8">{challenge?.description}</p>
          
          <div className="bg-black/20 border border-white/[0.05] rounded-2xl p-5 mb-8 shadow-inner">
            <h3 className="font-bold text-slate-300 mb-3 text-sm uppercase tracking-widest">Expected Output:</h3>
            <code className="text-emerald-400 text-sm block bg-black/40 p-4 rounded-xl border border-white/[0.05] font-mono shadow-inner">
              {challenge?.expectedOutput}
            </code>
          </div>

          {/* AI Feedback Display Area */}
          {feedback && (
            <div className={`p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-4 shadow-xl backdrop-blur-md ${
              feedback.status === "success" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Bot size={20} className={feedback.status === "success" ? "text-emerald-400" : "text-red-400"} />
                <h3 className={`font-bold uppercase tracking-widest text-xs ${feedback.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  AI Code Review Result
                </h3>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{feedback.text}</p>
            </div>
          )}
        </div>

        {/* Right Side: Code Editor */}
        <div className="flex flex-col bg-black/20 backdrop-blur-md h-full relative group/editor">
          {/* Subtle Editor Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-focus-within/editor:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Editor Header */}
          <div className="h-14 bg-white/[0.02] border-b border-white/[0.05] flex items-center px-4 justify-between shrink-0 relative z-10 backdrop-blur-xl">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-black/40 border border-white/[0.05] px-3 py-1.5 rounded-lg shadow-inner">
              solution.js
            </span>
            
            <button 
              onClick={handleAutoReview}
              disabled={isReviewing}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs uppercase tracking-widest font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500/50"
            >
              {isReviewing ? <Loader2 size={16} className="animate-spin" /> : <Play size={14} />}
              {isReviewing ? "AI is Reviewing..." : "Run & AI Review"}
            </button>
          </div>
          
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            className="flex-1 w-full p-6 bg-transparent text-slate-200 font-mono text-[15px] focus:outline-none resize-none leading-relaxed relative z-10 custom-scrollbar"
            placeholder="Write your code here..."
          />
        </div>

      </div>
    </div>
  );
}