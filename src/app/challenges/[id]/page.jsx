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
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/80 shrink-0">
        <Link href="/challenges" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Back to Challenges
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-yellow-500 font-bold flex items-center gap-1">
            <Trophy size={16} /> {challenge?.points} Pts
          </span>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        
        {/* Left Side: Challenge Details */}
        <div className="p-6 md:p-10 border-r border-slate-800 overflow-y-auto bg-slate-950/50">
          <div className="mb-6">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold border border-purple-500/20 uppercase">
              {challenge?.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{challenge?.title}</h1>
          <p className="text-slate-300 leading-relaxed mb-8">{challenge?.description}</p>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
            <h3 className="font-bold text-slate-200 mb-2">Expected Output:</h3>
            <code className="text-emerald-400 text-sm block bg-slate-950 p-3 rounded-lg border border-slate-800">
              {challenge?.expectedOutput}
            </code>
          </div>

          {/* AI Feedback Display Area */}
          {feedback && (
            <div className={`p-5 rounded-xl border animate-in fade-in slide-in-from-bottom-4 ${
              feedback.status === "success" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Bot size={20} className={feedback.status === "success" ? "text-emerald-400" : "text-red-400"} />
                <h3 className={`font-bold ${feedback.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  AI Code Review Result
                </h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{feedback.text}</p>
            </div>
          )}
        </div>

        {/* Right Side: Code Editor */}
        <div className="flex flex-col bg-[#0d1117] h-full">
          {/* Editor Header */}
          <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between shrink-0">
            <span className="text-sm font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-md">solution.js</span>
            
            <button 
              onClick={handleAutoReview}
              disabled={isReviewing}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              {isReviewing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {isReviewing ? "AI is Reviewing..." : "Run & AI Review"}
            </button>
          </div>
          
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            className="flex-1 w-full p-6 bg-transparent text-slate-200 font-mono text-[15px] focus:outline-none resize-none leading-relaxed"
            placeholder="Write your code here..."
          />
        </div>

      </div>
    </div>
  );
}