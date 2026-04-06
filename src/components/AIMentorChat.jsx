"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Terminal, Code } from "lucide-react";

export default function AIMentorChat({ userEmail }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // লোডিং স্টেট
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
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div className="flex flex-col h-[700px] w-full max-w-4xl mx-auto bg-[#0d1117] rounded-3xl overflow-hidden border border-gray-800 shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]">
      
      {/* --- Header --- */}
      <div className="bg-[#161b22]/80 backdrop-blur-md p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot size={28} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#0d1117] rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-100 flex items-center gap-2">
              Skill Spring Mentor <Sparkles size={16} className="text-yellow-400" />
            </h3>
            <p className="text-xs text-blue-400 font-medium">Powered by Llama 3.3</p>
          </div>
        </div>
        <div className="hidden md:flex gap-3">
          <Terminal size={20} className="text-gray-500 cursor-help" />
          <Code size={20} className="text-gray-500 cursor-help" />
        </div>
      </div>

      {/* --- Message Area --- */}
      <div className="flex-1 h-0 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,_#161b22_0%,_#0d1117_100%)] custom-scrollbar">
        <AnimatePresence>
          {fetching ? (
            <div className="h-full flex items-center justify-center text-blue-400 animate-pulse text-sm font-mono">
               {">"} পুরনো মেসেজগুলো লোড হচ্ছে...
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                  <Bot size={60} className="opacity-10" />
                  <p className="text-sm">হ্যালো জয়াশয়! আজ নতুন কী শিখতে চাও?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-[#161b22] text-gray-200 border border-gray-800 rounded-bl-none"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* --- Input Area --- */}
      <form onSubmit={sendMessage} className="p-6 bg-[#161b22] border-t border-gray-800">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="আপনার কোডিং সমস্যা এখানে লিখুন..."
            className="w-full p-4 pl-5 pr-14 bg-[#0d1117] text-gray-100 rounded-2xl border border-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600 shadow-inner"
          />
          <button 
            disabled={loading}
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:bg-blue-600 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-3 text-center uppercase tracking-widest font-bold">
          Skill Spring Official AI Mentor Hub
        </p>
      </form>
    </div>
  );
}