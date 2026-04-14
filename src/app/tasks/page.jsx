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
    <div className="min-h-screen bg-[#05070a] text-gray-300 py-20 px-6 relative overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: 50 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 50 }} className={`fixed top-24 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm backdrop-blur-xl ${toast.type === "success" ? "bg-[#0d1117]/90 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "bg-[#0d1117]/90 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]"}`}>
            {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0d1117] border border-red-500/30 p-8 rounded-[2rem] max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verification Required</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">You must verify your identity and add bank details in your profile settings before accepting any paid bounties.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowVerificationModal(false)} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition font-bold text-xs">Cancel</button>
                <Link href="/dashboard" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition font-bold text-xs uppercase tracking-widest flex items-center justify-center">Verify Now</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Real <span className="text-blue-500">Tasks</span></h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tasks.map((task) => {
                // ম্যাপ এরর ফিক্স:taskId এর বদলে tasks দিয়ে চেক করা হচ্ছে
                const myApp = myApplications.find(app => (app.tasks === task._id || app.tasks?._id === task._id));

                return (
                  <div key={task._id} className="group bg-[#0d1117]/80 border border-gray-800 rounded-3xl p-8 hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{task.company}</h3>
                        <h2 className="text-xl font-bold text-white">{task.title}</h2>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getDifficultyColor(task.difficulty)}`}>{task.difficulty}</div>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">{task.description}</p>

                    <div className="pt-6 border-t border-gray-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                          <DollarSign size={16} /> {task.price || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock size={14} /> {task.deadline}</div>
                      </div>
                      
                      {myApp ? (
                        myApp.status === "accepted" ? (
                          <span className="text-blue-400 text-xs font-bold uppercase border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 rounded-lg">Approved! Ready to Build.</span>
                        ) : myApp.status === "rejected" ? (
                          <span className="text-red-400 text-xs font-bold uppercase border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded-lg">Revision Required</span>
                        ) : myApp.status === "completed" ? (
                          <span className="text-emerald-400 text-xs font-bold uppercase border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle2 size={14}/> Paid & Completed</span>
                        ) : (
                          <button disabled className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest w-full md:w-auto">
                            {myApp.status === "applied" ? "Pending Approval" : myApp.status.toUpperCase()}
                          </button>
                        )
                      ) : (
                        <button onClick={() => handleApply(task._id)} disabled={actionLoading === task._id} className="bg-[#161b22] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all w-full md:w-auto flex justify-center items-center gap-2">
                          {actionLoading === task._id ? <Loader2 className="animate-spin" size={16} /> : <>Accept Task <ChevronRight size={14} /></>}
                        </button>
                      )}
                    </div>

                    {myApp && (myApp.status === "accepted" || myApp.status === "rejected") && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 pt-6 border-t border-dashed border-gray-700 space-y-4">
                        {myApp.status === "rejected" && (
                          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">Admin Feedback</p>
                              <p className="text-gray-300 text-sm italic">"{myApp.adminFeedback || "Please fix the issues and re-submit."}"</p>
                            </div>
                          </div>
                        )}
                        <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          {myApp.status === "rejected" ? "Fix & Re-submit Work" : "Submit Your Work"}
                        </h4>
                        <input type="text" placeholder="Live Project Link (Required)" value={submissionData.liveLink} onChange={(e) => setSubmissionData({...submissionData, liveLink: e.target.value})} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-xs text-white focus:border-blue-500 outline-none" />
                        <input type="text" placeholder="Client GitHub Repo (Required)" value={submissionData.clientRepo} onChange={(e) => setSubmissionData({...submissionData, clientRepo: e.target.value})} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-xs text-white focus:border-blue-500 outline-none" />
                        <input type="text" placeholder="Server GitHub Repo (Optional)" value={submissionData.serverRepo} onChange={(e) => setSubmissionData({...submissionData, serverRepo: e.target.value})} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-xs text-white focus:border-blue-500 outline-none" />
                        
                        <button onClick={() => handleSubmitWork(myApp._id)} disabled={actionLoading === myApp._id} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 mt-2">
                          {actionLoading === myApp._id ? <Loader2 className="animate-spin" size={16} /> : (myApp.status === "rejected" ? <>Update & Submit <Send size={14} /></> : <>Submit Project <Send size={14} /></>)}
                        </button>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 pb-6">
                <button 
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4 py-2 bg-[#0d1117] border border-gray-800 rounded-lg">
                  Page <span className="text-blue-500">{page}</span> of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 transition-all"
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