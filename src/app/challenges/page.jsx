import { connectMongoDB } from "@/lib/mongodb";
import Challenge from "@/models/Challenge";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Swords, Timer, Trophy, Flame, ArrowRight } from "lucide-react";

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);

  // ডাটাবেস থেকে ডেটা আনা
  await connectMongoDB();
  
  // ১. সব চ্যালেঞ্জ আনা
  const activeChallenges = await Challenge.find({}).lean();
  
  // ২. লিডারবোর্ডের জন্য সব ইউজারকে পয়েন্ট অনুযায়ী সাজানো (যার পয়েন্ট বেশি সে ওপরে)
  const allUsers = await User.find({}).sort({ points: -1 }).lean();
  
  // ৩. টপ ১০ জন হ্যাকারকে আলাদা করা
  const topHackers = allUsers.slice(0, 10);
  
  // ৪. বর্তমান লগইন করা ইউজারের র‍্যাংক বের করা
  let currentUserRank = null;
  let currentUserPoints = 0;
  if (session) {
    const userIndex = allUsers.findIndex(u => u.email === session.user.email);
    if (userIndex !== -1) {
      currentUserRank = userIndex + 1;
      currentUserPoints = allUsers[userIndex].points;
    }
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden text-white">
      {/* Background Decorative Gradients - Matching Global Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="p-6 md:p-12 max-w-7xl mx-auto relative z-10 pt-10">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6 font-bold tracking-widest text-[10px] uppercase shadow-inner">
            <Flame size={14} className="text-orange-500" /> Weekly Challenges
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
            Code, Compete, Conquer
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            বাস্তব জীবনের সমস্যাগুলো সমাধান করে নিজের স্কিল যাচাই করুন। লিডারবোর্ডের শীর্ষে উঠে জিতে নিন এক্সক্লুসিভ রিওয়ার্ড।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Challenges List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                <Swords className="text-purple-400" size={28} /> Active Challenges
              </h2>
            </div>

            {activeChallenges.map((challenge) => (
              <div
                key={challenge._id.toString()}
                className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 md:p-8 hover:border-purple-500/30 hover:bg-white/[0.03] transition-all group relative overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:from-purple-500/5 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-indigo-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                
                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg border shadow-inner ${
                        challenge.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 shadow-inner">
                        <Timer size={14} /> {challenge.timeLeft}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition-colors tracking-tight">{challenge.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2">{challenge.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2.5 py-1 rounded border border-white/[0.05] text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-white/[0.05] pt-6 md:pt-0 md:pl-6 min-w-[200px]">
                    <div className="text-left md:text-right mb-6">
                      <div className="flex items-center gap-2 mb-1 justify-start md:justify-end">
                        <Trophy size={20} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        <span className="text-3xl font-black text-white">{challenge.points}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Points Reward</span>
                    </div>

                    <Link href={`/challenges/${challenge._id}`} className="w-full">
                      <button className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 group/btn">
                        Accept Challenge <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Leaderboard */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 sticky top-28 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-tight">
                <Trophy className="text-yellow-500" size={24} /> Global Leaderboard
              </h3>
              
              <div className="space-y-3 mb-6">
                {topHackers.map((user, i) => {
                  const rank = i + 1;
                  const isMe = session?.user?.email === user.email;
                  return (
                    <div key={user._id.toString()} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${isMe ? "bg-purple-500/10 border-purple-500/30 shadow-inner" : "bg-black/20 border-white/[0.05] hover:bg-black/30"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                          rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-yellow-500/20" : 
                          rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-black" : 
                          rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black" : "bg-white/10 text-slate-400"
                        }`}>
                          {rank}
                        </div>
                        <span className={`text-sm font-semibold ${isMe ? "text-purple-300" : "text-slate-200"}`}>
                          {isMe ? "You" : user.name.split(" ")[0]}
                        </span>
                      </div>
                      <span className="text-sm font-black text-yellow-500 drop-shadow-sm">{user.points}</span>
                    </div>
                  );
                })}
              </div>

              {/* Current User Stats */}
              {session && currentUserRank > 10 && (
                <div className="pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 shadow-inner">
                     <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-white/10 text-slate-400">
                          {currentUserRank}
                        </div>
                        <span className="text-sm text-purple-300 font-semibold">You</span>
                     </div>
                     <span className="text-sm font-black text-yellow-500 drop-shadow-sm">{currentUserPoints}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}