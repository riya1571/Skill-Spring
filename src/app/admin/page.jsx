"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    CheckCircle, XCircle, Clock, ExternalLink, Terminal,
    LayoutDashboard, Briefcase, Code, Swords, Plus, Trash2, Loader2, Send,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ১. লোডিং শেষ হওয়া পর্যন্ত অপেক্ষা করা
    if (status === "loading") return;

    // ২. যদি লগইন না থাকে অথবা রোল যদি "admin" না হয়
    if (!session || session.user.role !== "admin") {
      router.push("/"); // হোমপেজে বা লগইন পেজে পাঠিয়ে দাও
    }
  }, [session, status, router]);

  // লোডিং স্টেটে একটি স্পিনার দেখানো ভালো
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // যদি অ্যাডমিন না হয়, তবে পেজ রেন্ডার করবে না
  if (!session || session.user.role !== "admin") {
    return null;
  }
    const [activeTab, setActiveTab] = useState("applications");
    const searchParams = useSearchParams();

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [applications, setApplications] = useState([]);
    const [appLoading, setAppLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [rejectingId, setRejectingId] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [taskLoading, setTaskLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "", company: "", description: "", price: "", difficulty: "Medium", tags: "", deadline: ""
    });

    // পেমেন্ট সাকসেসফুল হলে ডাটাবেস আপডেট এবং ইউআই রিফ্রেশ লজিক
    useEffect(() => {
        const success = searchParams.get("success");
        const appId = searchParams.get("appId");

        const updateStatusAfterPayment = async () => {
            if (success && appId) {
                try {
                    const res = await fetch("/api/admin/applications", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ applicationId: appId, status: "completed" })
                    });
                    if (res.ok) {
                        fetchApplications(); // ডাটা রিফ্রেশ
                        window.history.replaceState({}, '', '/admin'); // URL ক্লিনআপ
                    }
                } catch (err) {
                    console.error("Status Update Error:", err);
                }
            }
        };

        updateStatusAfterPayment();
    }, [searchParams]);

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "applications") fetchApplications();
        if (activeTab === "tasks") fetchTasks();
    }, [activeTab, page]);

    const fetchApplications = async () => {
        setAppLoading(true);
        try {
            const res = await fetch(`/api/admin/applications?page=${page}`);
            const data = await res.json();
            setApplications(data.applications || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) { console.error(error); } finally { setAppLoading(false); }
    };

    const fetchTasks = async () => {
        setTaskLoading(true);
        try {
            const res = await fetch(`/api/tasks?page=${page}`);
            const data = await res.json();
            setTasks(data.tasks || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) { console.error(error); } finally { setTaskLoading(false); }
    };

    const handleUpdateAppStatus = async (appId, newStatus, feedbackMsg = "") => {
        setActionLoading(appId);
        try {
            const payload = { applicationId: appId, status: newStatus, feedback: feedbackMsg };
            const res = await fetch("/api/admin/applications", {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });
            if (res.ok) {
                setApplications(apps => apps.map(app => app._id === appId ? { ...app, status: newStatus, adminFeedback: feedbackMsg } : app));
                setRejectingId(null); setFeedback("");
            }
        } catch (error) { console.error(error); } finally { setActionLoading(null); }
    };

    const handlePayment = async (app) => {
        if (!app.tasks?.price) return alert("Price not found for this task!");
        setActionLoading(app._id);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: app._id,
                    taskTitle: app.tasks?.title,
                    price: app.tasks?.price,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Payment failed to initialize");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setActionLoading("creating");
        try {
            const formattedTags = newTask.tags.split(",").map(tag => tag.trim());
            const res = await fetch("/api/tasks", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newTask, tags: formattedTags })
            });
            if (res.ok) {
                setShowTaskModal(false);
                setNewTask({ title: "", company: "", description: "", price: "", difficulty: "Medium", tags: "", deadline: "" });
                fetchTasks();
            }
        } catch (err) { console.error(err); } finally { setActionLoading(null); }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        setActionLoading(taskId);
        try {
            const res = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
            if (res.ok) setTasks(tasks.filter(t => t._id !== taskId));
        } catch (err) { console.error(err); } finally { setActionLoading(null); }
    };

    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex justify-center items-center gap-4 mt-12 pb-6">
                <button
                    onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Page <span className="text-blue-500">{page}</span> of {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 flex flex-col md:flex-row items-start relative">
            <div className="w-full md:w-64 bg-[#0d1117] border-r border-gray-800 p-6 flex flex-col gap-2 md:sticky md:top-0 md:h-screen overflow-y-auto z-10 shrink-0">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic mb-8 flex items-center gap-2">
                    <Terminal className="text-blue-500" /> Admin
                </h2>
                <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "applications" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"}`}><LayoutDashboard size={16} /> Reviews</button>
                <button onClick={() => setActiveTab("tasks")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "tasks" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"}`}><Briefcase size={16} /> Tasks</button>
                <button onClick={() => setActiveTab("projects")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "projects" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"}`}><Code size={16} /> Projects</button>
                <button onClick={() => setActiveTab("challenges")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "challenges" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"}`}><Swords size={16} /> Challenges</button>
            </div>

            <div className="flex-1 w-full p-6 md:p-12 mb-32 md:mb-0 pb-32">
                {activeTab === "applications" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8 border-b border-gray-800 pb-4">Review <span className="text-blue-500">Submissions</span></h1>
                        {appLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div> : (applications && applications.length === 0) ? (
                            <div className="bg-[#0d1117] border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-widest">No applications found.</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6">
                                    {applications.map((app) => (
                                        <div key={app._id} className="bg-[#0d1117]/80 border border-gray-800 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-lg font-bold text-white">{app.userId?.name}</h2>
                                                    <span className="px-2 py-1 bg-gray-800 rounded text-[10px] uppercase font-bold text-gray-400">{app.userId?.email}</span>
                                                </div>
                                                <p className="text-sm text-gray-400 mb-1"><span className="text-blue-500 font-bold">Task:</span> {app.tasks?.title || "No Title"}</p>
                                                <p className="text-xs text-gray-500 font-medium">Price: ${app.tasks?.price || 0} • Company: {app.tasks?.company || "Unknown"}</p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                                <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border flex items-center justify-center min-w-[130px]
                          ${app.status === 'applied' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                        app.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            app.status === 'submitted' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
                        `}>{app.status}</div>

                                                {app.status === 'applied' && (
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <button onClick={() => handleUpdateAppStatus(app._id, 'accepted')} disabled={actionLoading === app._id} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase transition-all">Approve</button>
                                                        <button onClick={() => handleUpdateAppStatus(app._id, 'rejected')} disabled={actionLoading === app._id} className="px-4 py-2 bg-red-900/50 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase transition-all border border-red-800">Reject</button>
                                                    </div>
                                                )}

                                                {app.status === 'submitted' && (
                                                    <div className="flex flex-col gap-3 w-full lg:w-80">
                                                        <div className="flex gap-2">
                                                            <a href={app.submission?.liveLink} target="_blank" className="flex-1 text-center bg-blue-500/10 text-blue-400 py-2 rounded-lg border border-blue-500/20 text-xs font-bold uppercase">Live</a>
                                                            <a href={app.submission?.clientRepo} target="_blank" className="flex-1 text-center bg-gray-800 text-gray-300 py-2 rounded-lg border border-gray-700 text-xs font-bold uppercase">Client</a>
                                                        </div>
                                                        {rejectingId === app._id ? (
                                                            <div className="space-y-2">
                                                                <textarea placeholder="Feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full bg-[#05070a] border border-red-500/30 p-3 rounded-xl text-xs text-white outline-none h-20" />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleUpdateAppStatus(app._id, 'rejected', feedback)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase">Confirm Reject</button>
                                                                    <button onClick={() => setRejectingId(null)} className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-[10px] font-bold uppercase">Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2 w-full">
                                                                {/* কন্ডিশনাল রেন্ডারিং ফর পে বাটন */}
                                                                <button
                                                                    onClick={() => handlePayment(app)}
                                                                    disabled={actionLoading === app._id}
                                                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase flex justify-center items-center gap-2"
                                                                >
                                                                    {actionLoading === app._id ? <Loader2 className="animate-spin" size={16} /> : `Pay $${app.tasks?.price || 0}`}
                                                                </button>

                                                                <button
                                                                    onClick={() => setRejectingId(app._id)}
                                                                    className="px-4 py-3 bg-red-900/30 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase hover:bg-red-600 hover:text-white transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* পেমেন্ট কমপ্লিট হয়ে গেলে যে বাটন দেখাবে */}
                                                {app.status === 'completed' && (
                                                    <button
                                                        disabled
                                                        className="w-full lg:w-48 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-not-allowed"
                                                    >
                                                        <CheckCircle size={16} /> Paid & Completed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <PaginationControls />
                            </>
                        )}
                    </motion.div>
                )}

                {activeTab === "tasks" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Manage <span className="text-blue-500">Tasks</span></h1>
                            <button onClick={() => setShowTaskModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> Add Task</button>
                        </div>
                        <AnimatePresence>
                            {showTaskModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0d1117] border border-gray-800 p-8 rounded-[2rem] max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                                        <button onClick={() => setShowTaskModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><XCircle size={24} /></button>
                                        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Create New Task</h2>
                                        <form onSubmit={handleCreateTask} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Task Title" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="col-span-2 bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" />
                                                <input type="text" placeholder="Company Name" required value={newTask.company} onChange={e => setNewTask({ ...newTask, company: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" />
                                                <input type="number" placeholder="Price ($)" required value={newTask.price} onChange={e => setNewTask({ ...newTask, price: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" />
                                                <select value={newTask.difficulty} onChange={e => setNewTask({ ...newTask, difficulty: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none">
                                                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option><option value="Expert">Expert</option>
                                                </select>
                                                <input type="text" placeholder="Deadline" required value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" />
                                            </div>
                                            <textarea placeholder="Description" required value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none h-24 resize-none" />
                                            <input type="text" placeholder="Tags" required value={newTask.tags} onChange={e => setNewTask({ ...newTask, tags: e.target.value })} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" />
                                            <button type="submit" disabled={actionLoading === "creating"} className="w-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2">
                                                {actionLoading === "creating" ? <Loader2 className="animate-spin" size={16} /> : <>Publish Task <Send size={14} /></>}
                                            </button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                        {taskLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div> : (
                            <>
                                <div className="grid grid-cols-1 gap-4">
                                    {tasks.map(task => (
                                        <div key={task._id} className="bg-[#0d1117]/80 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{task.title} <span className="text-xs text-gray-500 font-normal ml-2">({task.company})</span></h3>
                                                <p className="text-xs text-gray-400 mt-1">Price: ${task.price} • Difficulty: <span className="text-blue-400">{task.difficulty}</span></p>
                                            </div>
                                            <button onClick={() => handleDeleteTask(task._id)} disabled={actionLoading === task._id} className="p-3 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-500/20 w-max">{actionLoading === task._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}</button>
                                        </div>
                                    ))}
                                </div>
                                <PaginationControls />
                            </>
                        )}
                    </motion.div>
                )}

                {(activeTab === "projects" || activeTab === "challenges") && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-20 flex flex-col items-center justify-center text-center">
                        <Terminal size={48} className="text-gray-700 mb-4" />
                        <h2 className="text-2xl font-black text-gray-500 uppercase tracking-widest">{activeTab} Management</h2>
                        <p className="text-gray-600 text-sm mt-2">This module is under construction.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}