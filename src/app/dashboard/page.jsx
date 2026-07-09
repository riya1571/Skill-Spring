import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Star, Target, Code2, ArrowRight, Zap, ShieldCheck, ShieldAlert } from "lucide-react";
import PayoutSettings from "./PayoutSettings"; // আমাদের নতুন ক্লায়েন্ট কম্পোনেন্ট

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  await connectMongoDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  let completedProjectsDetails = [];
  if (dbUser && dbUser.completedProjects?.length > 0) {
    completedProjectsDetails = await Project.find({
      _id: { $in: dbUser.completedProjects }
    }).lean();
  }

  const points = dbUser?.points || 0;
  const level = Math.floor(points / 100) + 1;
  const isVerified = dbUser?.isVerified || false; // ভেরিফিকেশন স্ট্যাটাস

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden text-white">
      {/* Background Decorative Gradients - Matching Global Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="p-6 md:p-12 max-w-6xl mx-auto relative z-10 pt-10">
        {/* Header Profile Section */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-xl group hover:border-slate-600 transition-all">
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
            <Image
              src={session.user.image || "/default-avatar.png"}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-slate-800 shadow-xl relative z-10 bg-slate-900 object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-3xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3 flex-wrap tracking-tight">
              {session.user.name}
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-black uppercase tracking-widest shadow-inner">
                  <ShieldCheck size={14} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-[10px] font-black uppercase tracking-widest shadow-inner">
                  <ShieldAlert size={14} /> Unverified
                </span>
              )}
            </h1>
            <p className="text-slate-400 font-medium">{session.user.email}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 z-10">
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 text-center min-w-[120px] shadow-inner">
              <Trophy className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] mx-auto mb-2" size={24} />
              <p className="text-2xl font-black text-white">{points}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Points</p>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 text-center min-w-[120px] shadow-inner">
              <Star className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] mx-auto mb-2" size={24} />
              <p className="text-2xl font-black text-white">Lvl {level}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Current Rank</p>
            </div>
          </div>
        </div>

        {/* Payout Settings Form */}
        <PayoutSettings
          email={session.user.email}
          initialVerified={isVerified}
          initialBankDetails={dbUser?.bankDetails}
        />

        {/* Stats Overview */}
        <div className="mt-16 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <Target className="text-indigo-400" size={28} /> Learning Journey
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex items-center gap-5 shadow-inner hover:border-slate-600 transition-colors group">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
              <Code2 size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{completedProjectsDetails.length}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Projects Completed</p>
            </div>
          </div>

          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 flex items-center gap-5 opacity-70 grayscale cursor-not-allowed">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-500">0</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Streak Days (Soon)</p>
            </div>
          </div>
        </div>

        {/* Completed Projects Grid (Portfolio) */}
        <div className="mt-16 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
            <Trophy className="text-yellow-500" size={28} /> My Auto-Portfolio
          </h2>
        </div>

        {completedProjectsDetails.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 backdrop-blur-md rounded-2xl border border-dashed border-slate-700/70">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <Code2 size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-400 mb-6 font-medium">No projects completed yet.</p>
            <Link href="/projects">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-500/20 border border-indigo-500/50">
                Start Your First Project
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjectsDetails.map((project) => (
              <div key={project._id.toString()} className="group bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/50 hover:shadow-[0_15px_30px_-15px_rgba(99,102,241,0.2)] transition-all flex flex-col h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:from-indigo-500/5 transition-opacity duration-500 pointer-events-none" />

                <div className="absolute top-5 right-5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-emerald-500/20 flex items-center gap-1 shadow-inner backdrop-blur-md z-10">
                  <Target size={12} /> Completed
                </div>

                <h3 className="text-lg font-bold mb-3 pr-20 group-hover:text-indigo-300 transition-colors relative z-10">{project.title}</h3>
                <p className="text-sm text-slate-400 mb-6 flex-grow line-clamp-3 leading-relaxed relative z-10">{project.description}</p>

                <div className="flex flex-wrap gap-2 mt-auto relative z-10 pt-4 border-t border-slate-800/50">
                  {project.tags?.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold tracking-wider bg-slate-950/60 px-2.5 py-1 rounded border border-slate-700/50 text-slate-300 shadow-inner">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}