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
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-slate-950 text-white">
      {/* Header Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6 font-semibold tracking-wide text-sm">
          <Flame size={16} className="text-orange-500" /> Weekly Challenges
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Code, Compete, Conquer
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          বাস্তব জীবনের সমস্যাগুলো সমাধান করে নিজের স্কিল যাচাই করুন। লিডারবোর্ডের শীর্ষে উঠে জিতে নিন এক্সক্লুসিভ রিওয়ার্ড।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Challenges List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="text-purple-500" /> Active Challenges
            </h2>
          </div>

          {activeChallenges.map((challenge) => (
            <div
              key={challenge._id.toString()}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 hover:border-purple-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-purple-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${
                      challenge.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}>
                      {challenge.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                      <Timer size={12} /> {challenge.timeLeft}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{challenge.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{challenge.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map(tag => (
                      <span key={tag} className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-6 min-w-[200px]">
                  <div className="text-left md:text-right mb-6">
                    <div className="flex items-center gap-2 mb-1 justify-start md:justify-end">
                      <Trophy size={18} className="text-yellow-500" />
                      <span className="text-3xl font-bold text-white">{challenge.points}</span>
                    </div>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Points Reward</span>
                  </div>

                  {/* এই লিংকটি ইউজারকে কোড এডিটর/সাবমিশন পেজে নিয়ে যাবে */}
                  <Link href={`/challenges/${challenge._id}`} className="w-full">
                    <button className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg">
                      Accept Challenge <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Leaderboard */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Global Leaderboard
            </h3>
            
            <div className="space-y-4 mb-6">
              {topHackers.map((user, i) => {
                const rank = i + 1;
                const isMe = session?.user?.email === user.email;
                return (
                  <div key={user._id.toString()} className={`flex items-center justify-between p-3 rounded-xl border ${isMe ? "bg-purple-500/10 border-purple-500/50" : "bg-slate-950 border-slate-800"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        rank === 1 ? "bg-yellow-500 text-black" : 
                        rank === 2 ? "bg-slate-300 text-black" : 
                        rank === 3 ? "bg-orange-400 text-black" : "bg-slate-800 text-slate-400"
                      }`}>
                        {rank}
                      </div>
                      <span className={`text-sm ${isMe ? "text-purple-400 font-bold" : "text-slate-200"}`}>
                        {isMe ? "You" : user.name.split(" ")[0]}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-yellow-500">{user.points}</span>
                  </div>
                );
              })}
            </div>

            {/* Current User Stats */}
            {session && currentUserRank > 10 && (
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/50">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-800 text-slate-400">
                        {currentUserRank}
                      </div>
                      <span className="text-sm text-purple-400 font-bold">You</span>
                   </div>
                   <span className="text-sm font-bold text-yellow-500">{currentUserPoints}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}