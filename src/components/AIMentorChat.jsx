"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Terminal, Code } from "lucide-react";

export default function AIMentorChat({ userEmail }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail) return;
      try {
        const res = await fetch(`/api/mentor-chat?email=${userEmail}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchHistory();
  }, [userEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input, 
          email: userEmail, 
          history: messages.slice(-6) 
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[80vh] w-full max-w-4xl mx-auto bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-white/[0.05] shadow-2xl relative">
      
      {/* --- Header --- */}
      <div className="bg-white/[0.02] border-b border-white/[0.05] p-5 flex items-center justify-between relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot size={28} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-950 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-100 flex items-center gap-2 tracking-tight">
              Skill Spring Mentor <Sparkles size={16} className="text-yellow-400" />
            </h3>
            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Powered by Llama 3.3</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 opacity-50">
          <Terminal size={20} className="text-white cursor-help hover:text-purple-400 transition-colors" />
          <Code size={20} className="text-white cursor-help hover:text-purple-400 transition-colors" />
        </div>
      </div>

      {/* --- Message Area --- */}
      <div 
        ref={scrollRef} 
        data-lenis-prevent="true"
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-black/10 custom-scrollbar relative z-10"
      >
        <AnimatePresence>
          {fetching ? (
            <div className="h-full flex items-center justify-center text-purple-400 animate-pulse text-sm font-mono tracking-widest uppercase">
               {">"} Loading History...
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Bot size={60} className="opacity-20" />
                  <p className="text-sm tracking-wide">হ্যালো! আজ নতুন কী শিখতে চাও?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-[14px] sm:text-[15px] shadow-lg backdrop-blur-md leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-purple-600/80 border border-purple-500/50 text-white rounded-br-sm" 
                        : "bg-white/[0.05] border border-white/[0.1] text-slate-200 rounded-bl-sm"
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* --- Input Area --- */}
      <form onSubmit={sendMessage} className="p-4 md:p-5 bg-white/[0.02] border-t border-white/[0.05] relative z-10 shrink-0">
        <div className="relative group flex gap-2 sm:gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার কোডিং সমস্যা এখানে লিখুন..."
            className="w-full bg-black/40 border border-white/[0.1] rounded-2xl py-3.5 pl-4 sm:pl-5 pr-14 text-[14px] sm:text-[15px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
          />
          <button 
            disabled={loading || !input.trim()}
            type="submit"
            className="px-4 sm:px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-purple-600/20 font-bold"
          >
            <Send size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <p className="text-[9px] text-slate-500 mt-3 text-center uppercase tracking-widest font-bold">
          Skill Spring Official AI Mentor Hub
        </p>
      </form>
    </div>
  );
}