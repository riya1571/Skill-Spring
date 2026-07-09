"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, ArrowLeft, Loader2, Smile, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getPusherClient } from "@/lib/pusher";
import EmojiPicker from "emoji-picker-react";
import { format } from "date-fns";

export default function ChatPage() {
  const { id: connectionId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/community/messages?connectionId=${connectionId}`);
      if (!res.ok) {
        if (res.status === 403) router.push("/community");
        return;
      }
      const data = await res.json();
      setMessages(data.messages);
      setCurrentUserId(data.currentUserId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && connectionId) {
      fetchMessages();

      const pusher = getPusherClient();
      if (pusher) {
        const channel = pusher.subscribe(`chat-${connectionId}`);
        
        channel.bind("new-message", (data) => {
          setMessages((prev) => [...prev, data]);
        });

        return () => {
          pusher.unsubscribe(`chat-${connectionId}`);
        };
      }
    }
  }, [session, connectionId]);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setShowEmoji(false);
    try {
      const res = await fetch("/api/community/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, text: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden text-white pt-10 md:pt-20">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* The Chat Box Container */}
      <div className="max-w-4xl mx-auto px-4 w-full h-[75vh] md:h-[80vh]">
        <div className="w-full h-full bg-white/[0.01] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Top Navigation Bar inside Box */}
          <div className="h-16 border-b border-white/[0.05] flex items-center px-6 justify-between bg-white/[0.02] shrink-0 relative z-10">
            <Link href="/community" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold tracking-wide">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Community</span><span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="font-bold text-white tracking-widest uppercase text-xs sm:text-sm">
                Live Chat
              </div>
            </div>
          </div>

          {/* Chat Messages Area (Scrollable) */}
          <div ref={scrollContainerRef} data-lenis-prevent="true" className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 flex flex-col space-y-5 bg-black/10">
            {messages.length === 0 ? (
              <div className="m-auto text-slate-500 flex flex-col items-center">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p className="text-sm tracking-wide">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender.toString() === currentUserId?.toString();
                return (
                  <div key={msg._id} className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                    <div 
                      className={`px-5 py-3 rounded-2xl text-[14px] sm:text-[15px] shadow-lg backdrop-blur-md leading-relaxed ${
                        isMe 
                        ? "bg-purple-600/80 border border-purple-500/50 text-white rounded-br-sm" 
                        : "bg-white/[0.05] border border-white/[0.1] text-slate-200 rounded-bl-sm"
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5 uppercase tracking-widest font-bold">
                      {msg.createdAt ? format(new Date(msg.createdAt), "hh:mm a") : "Just now"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-5 bg-white/[0.02] border-t border-white/[0.05] shrink-0 relative z-10">
            
            {/* Emoji Picker Popup */}
            {showEmoji && (
              <div className="absolute bottom-[100%] right-4 sm:right-6 mb-2 z-50 shadow-2xl">
                <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} className="!w-[280px] sm:!w-[350px]" />
              </div>
            )}

            <form onSubmit={handleSendMessage} className="w-full flex gap-2 sm:gap-3 relative">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-black/40 border border-white/[0.1] rounded-2xl py-3 pl-4 sm:pl-5 pr-10 sm:pr-12 text-[14px] sm:text-[15px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
                />
                <button 
                  type="button" 
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors"
                >
                  <Smile size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 sm:px-6 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-600/20"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
