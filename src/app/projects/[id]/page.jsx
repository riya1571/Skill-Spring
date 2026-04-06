"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Send, Bot, User, Loader2, ArrowLeft, 
  Circle, CheckCircle2, Layout, Trophy, ExternalLink
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti"; // কনফেটি ইমপোর্ট
import { motion, AnimatePresence } from "framer-motion";

// --- এআই মেন্টর (আগের লজিক অনুযায়ী) ---
function DemoAiMentor() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "হ্যালো! আমি আপনার Skill Spring মেন্টর। এই প্রজেক্টটি নিয়ে কোনো হেল্প লাগবে?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages([...newMsgs, { role: "ai", content: "দুর্দান্ত প্রশ্ন! আমি আপনার কোড লজিক চেক করছি..." }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[480px] bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="p-4 bg-blue-600/10 border-b border-slate-800 flex items-center gap-2">
        <Bot size={18} className="text-blue-400" />
        <span className="text-xs font-black uppercase tracking-widest text-blue-400">AI Assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-slate-500 animate-pulse ml-2 italic">Mentor is thinking...</div>}
      </div>
      <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex gap-2">
        <input 
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask mentor..." className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition"><Send size={16}/></button>
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  // useEffect এর ভেতর এই চেকটি শক্তিশালী করো:
useEffect(() => {
  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects`);
      const data = await res.json();
      const current = data.find((p) => p._id === id);
      setProject(current);

      // ডাটাবেস থেকে চেক করা যে এই প্রজেক্ট অলরেডি সাবমিটেড কি না
      if (session?.user?.email && current) {
        const checkRes = await fetch(`/api/projects?email=${session.user.email}`);
        const mySavedProjects = await checkRes.json();
        
        // টাইটেল দিয়ে চেক করা (ID দিয়ে না, কারণ সাবমিট করলে নতুন ID তৈরি হয়)
        const exists = mySavedProjects.some(p => p.title === current.title);
        if (exists) {
          setIsCompleted(true);
          setCompletedTasks([1, 2, 3]); // সব টাস্ক অটো-টিক করে দেওয়া
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  fetchProject();
}, [id, session]);

  // সাবমিট লজিক উইথ কনফেটি
  const handleProjectSubmit = async () => {
    if (!session?.user?.email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: project.title,
          category: project.category || "Development", // Category এরর ফিক্স
          technologies: project.category,
          description: project.description,
          userEmail: session.user.email,
          live: "#"
        }),
      });

      if (res.ok) {
        // --- কনফেটি এনিমেশন ---
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        setIsCompleted(true);
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const tasks = [
    { id: 1, title: "Environment Setup", desc: "Install dependencies and setup Tailwind." },
    { id: 2, title: "Core Features", desc: "Implement main functionality and DB connection." },
    { id: 3, title: "Final Polish", desc: "Fix bugs and check UI responsiveness." }
  ];

  const progress = isCompleted ? 100 : Math.round((completedTasks.length / tasks.length) * 100);

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse italic">LOADING_PROJECT_DATA...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <Link href="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-10 transition-all text-sm font-medium">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-5">
               <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">{project?.category}</span>
               <span className="text-slate-600 text-xs font-bold uppercase tracking-tighter tracking-[1px]">{project?.difficulty}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">{project?.title}</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{project?.description}</p>
          </motion.div>

          {/* Progress Card */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-inner">
             <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Project Status</span>
                <span className="text-sm font-black text-blue-400">{progress}%</span>
             </div>
             <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" transition={{ duration: 0.8 }} />
             </div>
          </div>

          {/* Task Roadmap */}
          <div className="space-y-6">
             <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <Layout size={20} className="text-blue-500" /> Roadmap
             </h2>
             <div className="grid gap-4">
                {tasks.map((task) => {
                  const done = isCompleted || completedTasks.includes(task.id);
                  return (
                    <motion.div 
                      key={task.id} onClick={() => !isCompleted && setCompletedTasks(prev => prev.includes(task.id) ? prev.filter(t => t !== task.id) : [...prev, task.id])}
                      className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${done ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" : "bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer"}`}
                    >
                      <div className="mt-1">{done ? <CheckCircle2 className="text-emerald-500" size={20}/> : <Circle className="text-slate-700" size={20}/>}</div>
                      <div>
                        <h4 className={`text-sm font-bold ${done ? "text-emerald-400 line-through" : "text-white"}`}>{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{task.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
             </div>

             {/* Dynamic Action Area */}
             <AnimatePresence mode="wait">
                {progress === 100 && !isCompleted ? (
                  <motion.button 
                    key="submit-btn" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleProjectSubmit} disabled={submitting}
                    className="w-full py-5 bg-blue-600 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-blue-500 transition shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <><Trophy size={22}/> Complete Project</>}
                  </motion.button>
                ) : isCompleted ? (
                  <motion.div 
                    key="success-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-[2.5rem] text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500"><CheckCircle2 size={32}/></div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">MISSION ACCOMPLISHED!</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">প্রজেক্টটি সফলভাবে সম্পন্ন হয়েছে এবং আপনার পোর্টফোলিওতে যোগ করা হয়েছে।</p>
                    <Link href="/portfolio" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition">
                       Build Resume <ExternalLink size={14}/>
                    </Link>
                  </motion.div>
                ) : null}
             </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
           <div className="sticky top-12 space-y-8">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-500 mb-4">Project Mentor</h3>
                 <DemoAiMentor />
              </div>
              <div className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800">
                 <p className="text-[10px] text-slate-600 leading-relaxed font-bold uppercase tracking-wider">
                    এই প্রজেক্টটি আপনার প্রোফাইলে +500 XP যোগ করবে। একবার সাবমিট করার পর পুনরায় সাবমিট করা যাবে না।
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}