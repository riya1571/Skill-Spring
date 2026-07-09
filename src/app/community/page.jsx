"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, UserPlus, UserCheck, MessageSquare, ShieldAlert, Loader2, X, Check } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CommunityPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/community/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchUsers();
  }, [session]);

  const handleAction = async (targetUserId, action) => {
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/community/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });
      if (res.ok) {
        fetchUsers(); // refresh the list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Please sign in to view the community.
    </div>
  );

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="p-6 md:p-12 max-w-6xl mx-auto relative z-10 pt-10">
        <div className="text-center mb-16 relative">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Hacker Community
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Connect with other developers, send requests, and start real-time collaborations.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-purple-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user._id} className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 flex flex-col items-center text-center group hover:bg-white/[0.04] transition-all shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <Image 
                  src={user.image || "/default-avatar.png"} 
                  alt={user.name} 
                  width={80} height={80} 
                  className="rounded-full border border-white/[0.1] shadow-inner bg-black/50 mb-4 relative z-10 object-cover aspect-square"
                />
                
                <h3 className="text-lg font-bold text-white mb-1 relative z-10 tracking-tight">{user.name}</h3>
                <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-6 relative z-10">
                  {user.points} PTS
                </p>

                <div className="w-full relative z-10 mt-auto border-t border-white/[0.05] pt-5">
                  {user.connectionStatus === "none" && (
                    <button 
                      onClick={() => handleAction(user._id, "send")}
                      disabled={actionLoading === user._id}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                    >
                      {actionLoading === user._id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                      Connect
                    </button>
                  )}
                  
                  {user.connectionStatus === "pending_sent" && (
                    <button disabled className="w-full py-2.5 px-4 bg-black/40 border border-white/[0.05] text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                      <Loader2 size={16} className="animate-spin" />
                      Pending
                    </button>
                  )}

                  {user.connectionStatus === "pending_received" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(user._id, "accept")}
                        disabled={actionLoading === user._id}
                        className="flex-1 py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/20"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button 
                        onClick={() => handleAction(user._id, "reject")}
                        disabled={actionLoading === user._id}
                        className="flex-1 py-2.5 px-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}

                  {user.connectionStatus === "accepted" && (
                    <Link href={`/community/chat/${user.connectionId}`}>
                      <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                        <MessageSquare size={16} /> Open Chat
                      </button>
                    </Link>
                  )}

                  {user.connectionStatus === "rejected" && (
                    <button disabled className="w-full py-2.5 px-4 bg-black/40 border border-white/[0.05] text-red-400/50 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                      <ShieldAlert size={16} /> Rejected
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {users.length === 0 && !loading && (
              <div className="col-span-full text-center py-20 text-slate-500">
                No users found. Be the first one here!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}