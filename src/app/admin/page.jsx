"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CheckCircle, XCircle, Clock, Terminal,
    LayoutDashboard, Briefcase, Code, Swords, Plus, Trash2, Loader2, Send,
    ChevronLeft, ChevronRight, Pencil, Trophy, Users, ListTodo, Star
} from "lucide-react";

// মেইন লজিকটা এই কম্পোনেন্টের ভেতরে রাখা হলো
function AdminDashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState("applications");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const [applications, setApplications] = useState([]);
    const [appLoading, setAppLoading] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [rejectingId, setRejectingId] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [taskLoading, setTaskLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", company: "", description: "", price: "", difficulty: "Medium", tags: "", deadline: "" });

    const [projects, setProjects] = useState([]);
    const [projectLoading, setProjectLoading] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [projectForm, setProjectForm] = useState({ 
        title: "", description: "", category: "Web Development", difficulty: "Beginner", tags: "", tasksCount: 0 
    });

    const [challenges, setChallenges] = useState([]);
    const [challengeLoading, setChallengeLoading] = useState(true);
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [editingChallengeId, setEditingChallengeId] = useState(null);
    const [challengeForm, setChallengeForm] = useState({ 
        title: "", description: "", points: 0, difficulty: "Intermediate", timeLeft: "", expectedOutput: "", tags: "", participants: 0 
    });

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session?.user?.role !== "admin") router.push("/"); 
    }, [session, status, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        const appId = searchParams.get("appId");
        if (success && appId) {
            fetch("/api/admin/applications", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: appId, status: "completed" })
            }).then(res => { if (res.ok) { fetchApplications(); window.history.replaceState({}, '', '/admin'); } });
        }
    }, [searchParams]);

    useEffect(() => { setPage(1); }, [activeTab]);

    useEffect(() => {
        if (activeTab === "applications") fetchApplications();
        if (activeTab === "tasks") fetchTasks();
        if (activeTab === "projects") fetchProjects();
        if (activeTab === "challenges") fetchChallenges();
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

    const fetchProjects = async () => {
        setProjectLoading(true);
        try {
            const res = await fetch(`/api/projects?page=${page}`);
            const data = await res.json();
            setProjects(data.projects || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) { console.error(error); } finally { setProjectLoading(false); }
    };

    const fetchChallenges = async () => {
        setChallengeLoading(true);
        try {
            const res = await fetch(`/api/challenges?page=${page}`);
            const data = await res.json();
            setChallenges(data.challenges || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) { console.error(error); } finally { setChallengeLoading(false); }
    };

    const handleUpdateAppStatus = async (appId, newStatus, feedbackMsg = "") => {
        setActionLoading(appId);
        try {
            const payload = { applicationId: appId, status: newStatus, feedback: feedbackMsg };
            const res = await fetch("/api/admin/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: app._id, taskTitle: app.tasks?.title, price: app.tasks?.price }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url; else alert("Payment failed");
        } catch (error) { console.error(error); } finally { setActionLoading(null); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setActionLoading("creating_task");
        try {
            const formattedTags = newTask.tags.split(",").map(tag => tag.trim());
            const res = await fetch("/api/tasks", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newTask, tags: formattedTags })
            });
            if (res.ok) { setShowTaskModal(false); fetchTasks(); }
        } catch (err) { console.error(err); } finally { setActionLoading(null); }
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        setActionLoading("saving_project");
        const method = editingProjectId ? "PUT" : "POST";
        const url = editingProjectId ? `/api/projects?id=${editingProjectId}` : "/api/projects";
        
        try {
            const payload = {
                ...projectForm,
                tasksCount: Number(projectForm.tasksCount),
                tags: Array.isArray(projectForm.tags) ? projectForm.tags : projectForm.tags.split(",").map(t => t.trim())
            };
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                setShowProjectModal(false); setEditingProjectId(null); fetchProjects();
            }
        } catch (err) { console.error(err); } finally { setActionLoading(null); }
    };

    const openEditProject = (project) => {
        setEditingProjectId(project._id);
        setProjectForm({
            title: project.title || "", description: project.description || "", category: project.category || "Web Development",
            difficulty: project.difficulty || "Beginner", tasksCount: project.tasksCount || 0, tags: project.tags ? project.tags.join(", ") : ""
        });
        setShowProjectModal(true);
    };

    const handleSaveChallenge = async (e) => {
        e.preventDefault();
        setActionLoading("saving_challenge");
        const method = editingChallengeId ? "PUT" : "POST";
        const url = editingChallengeId ? `/api/challenges?id=${editingChallengeId}` : "/api/challenges";

        try {
            const payload = {
                ...challengeForm,
                points: Number(challengeForm.points),
                participants: Number(challengeForm.participants),
                tags: Array.isArray(challengeForm.tags) ? challengeForm.tags : challengeForm.tags.split(",").map(t => t.trim())
            };
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                setShowChallengeModal(false); setEditingChallengeId(null); fetchChallenges();
            }
        } catch (err) { console.error(err); } finally { setActionLoading(null); }
    };

    const openEditChallenge = (challenge) => {
        setEditingChallengeId(challenge._id);
        setChallengeForm({
            title: challenge.title || "", description: challenge.description || "", points: challenge.points || 0,
            difficulty: challenge.difficulty || "Intermediate", timeLeft: challenge.timeLeft || "", expectedOutput: challenge.expectedOutput || "",
            participants: challenge.participants || 0, tags: challenge.tags ? challenge.tags.join(", ") : ""
        });
        setShowChallengeModal(true);
    };

    const handleDelete = async (collection, id) => {
        if (!confirm(`Are you sure you want to delete this ${collection.slice(0, -1)}?`)) return;
        setActionLoading(id);
        try {
            const res = await fetch(`/api/${collection}?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                if(collection === 'tasks') fetchTasks();
                if(collection === 'projects') fetchProjects();
                if(collection === 'challenges') fetchChallenges();
            }
        } catch (err) { console.error(err); } finally { setActionLoading(null); }
    };

    if (status === "loading") return <div className="min-h-screen bg-[#05070a] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
    if (!session || session?.user?.role !== "admin") return null;

    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex justify-center items-center gap-4 mt-12 pb-6">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page <span className="text-blue-500">{page}</span> of {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 flex flex-col md:flex-row items-start relative">
            <div className="w-full md:w-64 bg-[#0d1117] border-r border-gray-800 p-6 flex flex-col gap-2 md:sticky md:top-0 md:h-screen overflow-y-auto z-10 shrink-0">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic mb-8 flex items-center gap-2"><Terminal className="text-blue-500" /> Admin</h2>
                <button onClick={() => setActiveTab("applications")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "applications" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800"}`}><LayoutDashboard size={16} /> Reviews</button>
                <button onClick={() => setActiveTab("tasks")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "tasks" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800"}`}><Briefcase size={16} /> Tasks</button>
                <button onClick={() => setActiveTab("projects")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "projects" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800"}`}><Code size={16} /> Projects</button>
                <button onClick={() => setActiveTab("challenges")} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "challenges" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-800"}`}><Swords size={16} /> Challenges</button>
            </div>

            <div className="flex-1 w-full p-6 md:p-12 mb-32 md:mb-0 pb-32">
                {activeTab === "applications" && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8 border-b border-gray-800 pb-4">Review <span className="text-blue-500">Submissions</span></h1>
                        {appLoading ? <Loader2 className="animate-spin mx-auto text-blue-500" size={32} /> : (
                            <div className="grid grid-cols-1 gap-6">
                                {applications.map((app) => (
                                    <div key={app._id} className="bg-[#0d1117]/80 border border-gray-800 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-blue-500/30">
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-white">{app.userId?.name} <span className="text-[10px] text-gray-500 uppercase">{app.userId?.email}</span></h2>
                                            <p className="text-sm text-gray-400 mt-2"><span className="text-blue-500 font-bold">Task:</span> {app.tasks?.title}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-2 rounded-xl text-xs font-bold uppercase border bg-gray-800 text-gray-300 min-w-[130px] text-center">{app.status}</div>
                                            {app.status === 'applied' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateAppStatus(app._id, 'accepted')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Approve</button>
                                                    <button onClick={() => handleUpdateAppStatus(app._id, 'rejected')} className="px-4 py-2 bg-red-900/50 text-white rounded-xl text-xs font-bold">Reject</button>
                                                </div>
                                            )}
                                            {app.status === 'submitted' && (
                                                <button onClick={() => handlePayment(app)} disabled={actionLoading === app._id} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                                                    {actionLoading === app._id ? <Loader2 className="animate-spin" size={14} /> : `Pay $${app.tasks?.price}`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <PaginationControls />
                    </motion.div>
                )}

                {activeTab === "tasks" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Manage <span className="text-blue-500">Tasks</span></h1>
                            <button onClick={() => setShowTaskModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2"><Plus size={16} /> Add Task</button>
                        </div>
                        {taskLoading ? <Loader2 className="animate-spin mx-auto text-blue-500" size={32} /> : (
                            <div className="grid grid-cols-1 gap-4">
                                {tasks.map(task => (
                                    <div key={task._id} className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5 flex justify-between items-center">
                                        <div><h3 className="text-lg font-bold text-white">{task.title}</h3><p className="text-xs text-gray-400">Price: ${task.price}</p></div>
                                        <button onClick={() => handleDelete('tasks', task._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <PaginationControls />
                    </motion.div>
                )}

                {activeTab === "projects" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Manage <span className="text-blue-500">Projects</span></h1>
                            <button onClick={() => { 
                                setEditingProjectId(null); 
                                setProjectForm({ title: "", description: "", category: "Web Development", difficulty: "Beginner", tags: "", tasksCount: 0 }); 
                                setShowProjectModal(true); 
                            }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> Add Project</button>
                        </div>

                        <AnimatePresence>
                            {showProjectModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0d1117] border border-gray-800 p-8 rounded-[2rem] max-w-xl w-full shadow-2xl relative">
                                        <button onClick={() => setShowProjectModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><XCircle size={24} /></button>
                                        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">{editingProjectId ? "Edit Project" : "Create Project"}</h2>
                                        <form onSubmit={handleSaveProject} className="space-y-4">
                                            <input type="text" placeholder="Project Title" required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                            <textarea placeholder="Description" required value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white h-20 resize-none" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Category (e.g. Web Development)" required value={projectForm.category} onChange={e => setProjectForm({ ...projectForm, category: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                <select value={projectForm.difficulty} onChange={e => setProjectForm({ ...projectForm, difficulty: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white">
                                                    <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                                                </select>
                                                <input type="number" placeholder="Tasks Count" required value={projectForm.tasksCount} onChange={e => setProjectForm({ ...projectForm, tasksCount: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                <input type="text" placeholder="Tags (comma separated)" required value={projectForm.tags} onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                            </div>
                                            <button type="submit" disabled={actionLoading === "saving_project"} className="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex justify-center items-center gap-2">
                                                {actionLoading === "saving_project" ? <Loader2 className="animate-spin" size={16} /> : <>{editingProjectId ? "Update" : "Publish"} <Send size={14} /></>}
                                            </button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {projectLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div> : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {projects.map(p => (
                                    <div key={p._id} className="bg-[#0d1117] border border-gray-800 p-6 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditProject(p)} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg"><Pencil size={16} /></button>
                                                    <button onClick={() => handleDelete('projects', p._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded w-max mb-3">{p.category}</div>
                                            <p className="text-xs text-gray-400 mb-4">{p.description?.substring(0, 100)}...</p>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 border-t border-gray-800 pt-4 mt-2">
                                            <span className="flex items-center gap-1"><ListTodo size={14}/> {p.tasksCount} Tasks</span>
                                            <span className="flex items-center gap-1"><Star size={14} className="text-orange-400"/> {p.difficulty}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <PaginationControls />
                    </motion.div>
                )}

                {activeTab === "challenges" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Challenge <span className="text-purple-500">Arena</span></h1>
                            <button onClick={() => { 
                                setEditingChallengeId(null); 
                                setChallengeForm({ title: "", description: "", points: 0, difficulty: "Intermediate", timeLeft: "", expectedOutput: "", tags: "", participants: 0 }); 
                                setShowChallengeModal(true); 
                            }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> Add Challenge</button>
                        </div>

                        <AnimatePresence>
                            {showChallengeModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0d1117] border border-gray-800 p-8 rounded-[2rem] max-w-2xl w-full shadow-2xl relative">
                                        <button onClick={() => setShowChallengeModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><XCircle size={24} /></button>
                                        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">{editingChallengeId ? "Edit Challenge" : "Create Challenge"}</h2>
                                        <form onSubmit={handleSaveChallenge} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="Challenge Title" required value={challengeForm.title} onChange={e => setChallengeForm({ ...challengeForm, title: e.target.value })} className="col-span-2 bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                <textarea placeholder="Description" required value={challengeForm.description} onChange={e => setChallengeForm({ ...challengeForm, description: e.target.value })} className="col-span-2 bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white h-20 resize-none" />
                                                
                                                <input type="number" placeholder="Points (e.g. 100)" required value={challengeForm.points} onChange={e => setChallengeForm({ ...challengeForm, points: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                <select value={challengeForm.difficulty} onChange={e => setChallengeForm({ ...challengeForm, difficulty: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white">
                                                    <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Expert">Expert</option>
                                                </select>
                                                
                                                <input type="text" placeholder="Time Left (e.g. 2 Days Left)" required value={challengeForm.timeLeft} onChange={e => setChallengeForm({ ...challengeForm, timeLeft: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                <input type="number" placeholder="Initial Participants" value={challengeForm.participants} onChange={e => setChallengeForm({ ...challengeForm, participants: e.target.value })} className="bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                
                                                <input type="text" placeholder="Expected Output" required value={challengeForm.expectedOutput} onChange={e => setChallengeForm({ ...challengeForm, expectedOutput: e.target.value })} className="col-span-2 bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                                <input type="text" placeholder="Tags (comma separated)" required value={challengeForm.tags} onChange={e => setChallengeForm({ ...challengeForm, tags: e.target.value })} className="col-span-2 bg-[#05070a] border border-gray-800 p-3 rounded-xl text-sm text-white" />
                                            </div>
                                            <button type="submit" disabled={actionLoading === "saving_challenge"} className="w-full bg-purple-600 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex justify-center items-center gap-2 mt-4">
                                                {actionLoading === "saving_challenge" ? <Loader2 className="animate-spin" size={16} /> : <>{editingChallengeId ? "Update" : "Publish"} <Send size={14} /></>}
                                            </button>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {challengeLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-purple-500" size={32} /></div> : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {challenges.map(c => (
                                    <div key={c._id} className="bg-[#0d1117] border border-gray-800 p-6 rounded-2xl border-l-4 border-l-purple-500 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white">{c.title}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditChallenge(c)} className="text-purple-400 hover:bg-purple-500/10 p-2 rounded-lg"><Pencil size={16} /></button>
                                                    <button onClick={() => handleDelete('challenges', c._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mb-3">
                                                <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded w-max ${c.difficulty === 'Expert' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>{c.difficulty}</span>
                                                <span className="text-[9px] font-bold uppercase px-2 py-1 rounded w-max bg-gray-800 text-gray-400"><Clock size={10} className="inline mr-1"/>{c.timeLeft}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-4">{c.description?.substring(0, 80)}...</p>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 border-t border-gray-800 pt-4 mt-2">
                                            <span className="flex items-center gap-1 text-emerald-400"><Trophy size={14}/> {c.points} Points</span>
                                            <span className="flex items-center gap-1"><Users size={14}/> {c.participants} Enrolled</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <PaginationControls />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// এই ফাংশনটি মেইন পেজ হিসেবে এক্সপোর্ট করা হলো যা Suspense বাউন্ডারি প্রোভাইড করে
export default function AdminDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        }>
            <AdminDashboardContent />
        </Suspense>
    );
}