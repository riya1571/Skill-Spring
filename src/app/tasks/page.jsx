"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Code, Clock, DollarSign, ChevronRight, 
  Terminal, AlertCircle, Loader2, Send, CheckCircle2,
  ChevronLeft 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RealTasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({ liveLink: "", clientRepo: "", serverRepo: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => { setToast({ show: false, message: "", type: "success" }); }, 3500);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const taskRes = await fetch(`/api/tasks?page=${page}`);
        const taskData = await taskRes.json();
        
        setTasks(taskData.tasks || taskData);
        setTotalPages(taskData.totalPages || 1);

        if (session?.user?.email) {
          const appRes = await fetch(`/api/applications?email=${session.user.email}`);
          const appData = await appRes.json();
          setMyApplications(appData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [session, page]);

  const handleApply = async (taskId) => {
    if (!session) return router.push("/login");
    setActionLoading(taskId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        // এখানেtaskId পাঠানো হচ্ছে, যা ব্যাকএন্ডে 'tasks' হিসেবে সেভ হবে
        body: JSON.stringify({ userEmail: session.user.email, taskId })
      });
      const data = await res.json();
      
      if (res.status === 403 && data.notVerified) {
        setShowVerificationModal(true);
      } else if (res.ok) {
        triggerToast("Task Accepted! Waiting for Admin Approval.", "success");
        // স্টেট আপডেট করার সময়ও 'tasks' কি ব্যবহার করছি
        setMyApplications([...myApplications, { tasks: taskId, status: "applied" }]);
      } else {
        triggerToast(data.message || "Something went wrong!", "error");
      }
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleSubmitWork = async (applicationId) => {
    if(!submissionData.liveLink || !submissionData.clientRepo) {
      triggerToast("Live Link and Client Repo are required!", "error");
      return;
    }
    setActionLoading(applicationId);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, ...submissionData })
      });
      if(res.ok) {
        triggerToast("Work Submitted! Admin will review soon.", "success");
        setMyApplications(apps => apps.map(app => app._id === applicationId ? {...app, status: "submitted"} : app));
        setSubmissionData({ liveLink: "", clientRepo: "", serverRepo: "" });
      } else { triggerToast("Failed to submit work.", "error"); }
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case "Easy": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Medium": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Hard": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "Expert": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: 50 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 50 }} className={`fixed top-24 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm backdrop-blur-xl ${toast.type === "success" ? "bg-slate-900/90 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "bg-slate-900/90 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]"}`}>
            {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-slate-900/90 border border-red-500/30 p-8 rounded-[2rem] max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center backdrop-blur-xl">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-500/20"><AlertCircle size={32} /></div>
              <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Verification Required</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">You must verify your identity and add bank details in your profile settings before accepting any paid bounties.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowVerificationModal(false)} className="flex-1 py-3.5 rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-inner">Cancel</button>
                <Link href="/dashboard" className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center justify-center">Verify Now</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-10">
        <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Briefcase size={14} /> Earn While You Learn
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
              Real-World{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Tasks
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Complete real tasks, submit your work, and get paid upon approval. Level up your portfolio while earning.
            </p>
          </motion.div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <span className="text-blue-400/80 text-sm uppercase tracking-widest animate-pulse font-bold">Fetching Tasks...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
              {tasks.map((task, index) => {
                const myApp = myApplications.find(app => (app.tasks === task._id || app.tasks?._id === task._id));

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                    key={task._id} 
                    className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-6 md:p-8 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] transition-all flex flex-col h-full overflow-hidden"
                  >
                    {/* Glowing hover border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-purple-500/0 opacity-0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-slate-400"><Briefcase size={14} /></span>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{task.company}</h3>
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-blue-300 transition-colors">{task.title}</h2>
                        </div>
                        <div className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-inner ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-400 mb-8 leading-relaxed flex-grow line-clamp-4">{task.description}</p>

                      <div className="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                        <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                          <div className="flex items-center gap-1.5 text-sm font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                            <DollarSign size={18} /> {task.price || 0}
                          </div>
                          <div className="w-px h-6 bg-slate-700/50"></div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Clock size={16} className="text-slate-500" /> {task.deadline}
                          </div>
                        </div>
                        
                        <div className="w-full sm:w-auto">
                          {myApp ? (
                            myApp.status === "accepted" ? (
                              <span className="w-full sm:w-auto flex justify-center text-blue-400 text-xs font-bold uppercase border border-blue-500/30 bg-blue-500/10 px-5 py-3 rounded-xl shadow-inner">Approved! Ready</span>
                            ) : myApp.status === "rejected" ? (
                              <span className="w-full sm:w-auto flex justify-center text-red-400 text-xs font-bold uppercase border border-red-500/30 bg-red-500/10 px-5 py-3 rounded-xl shadow-inner">Revision Required</span>
                            ) : myApp.status === "completed" ? (
                              <span className="w-full sm:w-auto flex justify-center items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 rounded-xl shadow-inner"><CheckCircle2 size={16}/> Paid</span>
                            ) : (
                              <button disabled className="w-full sm:w-auto flex justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest opacity-80 cursor-not-allowed">
                                {myApp.status === "applied" ? "Pending Approval" : myApp.status.toUpperCase()}
                              </button>
                            )
                          ) : (
                            <button onClick={() => handleApply(task._id)} disabled={actionLoading === task._id} className="w-full sm:w-auto relative bg-slate-800 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 overflow-hidden group/btn border border-slate-700 hover:border-blue-500">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                              <span className="relative z-10 flex items-center gap-2">
                                {actionLoading === task._id ? <Loader2 className="animate-spin" size={16} /> : <>Accept Task <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></>}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Submission Section */}
                      <AnimatePresence>
                        {myApp && (myApp.status === "accepted" || myApp.status === "rejected") && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t border-dashed border-slate-700/70 space-y-4 overflow-hidden">
                            {myApp.status === "rejected" && (
                              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 shadow-inner">
                                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                                <div>
                                  <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Admin Feedback</p>
                                  <p className="text-slate-300 text-sm font-medium italic">"{myApp.adminFeedback || "Please fix the issues and re-submit."}"</p>
                                </div>
                              </div>
                            )}
                            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 bg-blue-500/10 w-max px-3 py-1.5 rounded-lg border border-blue-500/20">
                              {myApp.status === "rejected" ? "Fix & Re-submit Work" : "Submit Your Work"}
                            </h4>
                            
                            <div className="space-y-3">
                              <input type="text" placeholder="Live Project Link (Required)" value={submissionData.liveLink} onChange={(e) => setSubmissionData({...submissionData, liveLink: e.target.value})} className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner hover:border-slate-600" />
                              <input type="text" placeholder="Client GitHub Repo (Required)" value={submissionData.clientRepo} onChange={(e) => setSubmissionData({...submissionData, clientRepo: e.target.value})} className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner hover:border-slate-600" />
                              <input type="text" placeholder="Server GitHub Repo (Optional)" value={submissionData.serverRepo} onChange={(e) => setSubmissionData({...submissionData, serverRepo: e.target.value})} className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all shadow-inner hover:border-slate-600" />
                            </div>
                            
                            <button onClick={() => handleSubmitWork(myApp._id)} disabled={actionLoading === myApp._id} className="w-full relative bg-slate-800 border border-slate-700 hover:border-blue-500 text-white px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 mt-4 overflow-hidden group/submit shadow-lg">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover/submit:opacity-100 transition-opacity duration-300" />
                              <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                                {actionLoading === myApp._id ? <Loader2 className="animate-spin" size={16} /> : (myApp.status === "rejected" ? <>Update & Submit <Send size={14} className="group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" /></> : <>Submit Project <Send size={14} className="group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" /></>)}
                              </span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16 pb-6">
                <button 
                  onClick={() => {
                    setPage(p => p - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }} 
                  disabled={page === 1}
                  className="p-3.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-inner"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-5 py-3.5 bg-slate-950/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-inner">
                  Page <span className="text-blue-400 ml-1">{page}</span> of {totalPages}
                </span>
                <button 
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }} 
                  disabled={page === totalPages || totalPages === 0}
                  className="p-3.5 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-inner"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}