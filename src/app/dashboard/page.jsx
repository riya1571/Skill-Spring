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
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-slate-950 text-white">
      
      {/* Header Profile Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
        
        <Image 
          src={session.user.image || "/default-avatar.png"} 
          alt="Profile" 
          width={100} 
          height={100} 
          className="rounded-2xl border-4 border-slate-800 shadow-xl z-10"
        />
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3 flex-wrap">
            {session.user.name}
            {/* ডাইনামিক ভেরিফিকেশন ব্যাজ */}
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ShieldAlert size={14} /> Unverified
              </span>
            )}
          </h1>
          <p className="text-slate-400">{session.user.email}</p>
        </div>

        <div className="flex gap-4 z-10">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[120px]">
            <Trophy className="text-yellow-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-white">{points}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Points</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[120px]">
            <Star className="text-blue-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-white">Lvl {level}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Rank</p>
          </div>
        </div>
      </div>

      {/* আমাদের নতুন Payout Settings Form */}
      <PayoutSettings 
        email={session.user.email} 
        initialVerified={isVerified} 
        initialBankDetails={dbUser?.bankDetails} 
      />

      {/* Stats Overview */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Target className="text-blue-500" /> Learning Journey
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Code2 size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold">{completedProjectsDetails.length}</p>
            <p className="text-sm text-slate-400">Projects Completed</p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 opacity-50">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-slate-400">Streak Days (Coming Soon)</p>
          </div>
        </div>
      </div>

      {/* Completed Projects Grid (Portfolio) */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="text-yellow-500" /> My Auto-Portfolio
      </h2>

      {completedProjectsDetails.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <p className="text-slate-400 mb-4 text-lg">আপনি এখনো কোনো প্রজেক্ট সম্পন্ন করেননি।</p>
          <Link href="/projects">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20">
              Start Your First Project
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedProjectsDetails.map((project) => (
            <div key={project._id.toString()} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-emerald-500/20 flex items-center gap-1">
                <Target size={12} /> Completed
              </div>

              <h3 className="text-xl font-bold mb-2 pr-20">{project.title}</h3>
              <p className="text-sm text-slate-400 mb-6 flex-grow line-clamp-2">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags?.map(tag => (
                  <span key={tag} className="text-[10px] uppercase font-medium bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}