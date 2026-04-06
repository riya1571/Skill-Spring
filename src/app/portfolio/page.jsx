"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Eye, User, Code, Briefcase, GraduationCap, 
  Globe, Plus, Trash2, ArrowRight, Check, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

export default function PortfolioEditor() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [myProjects, setMyProjects] = useState([]); // প্ল্যাটফর্মের কমপ্লিটেড প্রজেক্ট
  const [selectedIds, setSelectedIds] = useState([]); // কোনগুলো টিক দেওয়া হয়েছে
  const [manualProjects, setManualProjects] = useState([]); // কাস্টম প্রজেক্ট
  
  const [profile, setProfile] = useState({
    fullName: "", jobTitle: "", phone: "", location: "",
    linkedin: "", github: "", portfolio: "", careerObjective: "",
    skills: { languages: "", frontend: "", backend: "", databases: "" },
    education: { university: "", degree: "", duration: "", cgpa: "" },
    achievements: { icpc: "", uta: "", cpProfiles: "" },
    languagesKnown: "Bengali (Native), English (Professional)"
  });

 // ... আগের ইমপোর্টগুলো ঠিক থাকবে

useEffect(() => {
  const loadAllData = async () => {
    if (!session?.user?.email) {
      console.log("❌ সেশন বা ইমেইল পাওয়া যায়নি এখনো।");
      return;
    }

    setLoading(true);
    try {
      console.log("🔍 ডাটা ফেচিং শুরু হচ্ছে এই ইমেইলের জন্য:", session.user.email);

      // ১. প্রোফাইল ডাটা লোড
      const profRes = await fetch(`/api/profile?email=${session.user.email}`, { cache: 'no-store' });
      const profData = await profRes.json();
      console.log("✅ প্রোফাইল ডাটা পাওয়া গেছে:", profData);

      if (!profData.isNew) {
        setProfile(profData);
        setManualProjects(profData.manualProjects || []);
      } else {
        setProfile(prev => ({...prev, fullName: session.user.name, userEmail: session.user.email}));
      }

      // ২. প্ল্যাটফর্ম প্রজেক্ট লোড (সবচেয়ে গুরুত্বপূর্ণ অংশ)
      const projRes = await fetch(`/api/projects?email=${session.user.email}`, { cache: 'no-store' });
      const projData = await projRes.json();
      
      // এই লগটি ব্রাউজার কনসোলে দেখো
      console.log("🚀 ডাটাবেস থেকে আসা প্রজেক্ট লিস্ট:", projData);

      if (Array.isArray(projData)) {
        setMyProjects(projData);
        
        // সিলেকশন লজিক
        if (profData.selectedProjectIds && profData.selectedProjectIds.length > 0) {
          setSelectedIds(profData.selectedProjectIds);
        } else {
          // ডিফল্টভাবে সব সিলেক্ট করো যদি আগে থেকে কিছু সেভ না থাকে
          setSelectedIds(projData.map(p => p._id));
        }
      } else {
        console.error("❌ প্রজেক্ট ডাটা অ্যারে হিসেবে আসেনি:", projData);
      }

    } catch (err) {
      console.error("🔥 লোড করার সময় বড় এরর হয়েছে:", err);
    } finally {
      setLoading(false);
    }
  };

  loadAllData();
}, [session]);

// ... বাকি রিটার্ন কোড ঠিক থাকবে

  // ২. সেভ লজিক
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...profile, 
          userEmail: session.user.email, 
          selectedProjectIds: selectedIds, 
          manualProjects: manualProjects 
        }),
      });
      setSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setSaving(false);
      alert("Save failed! Check storage or connection.");
    }
  };

  // ৩. হেল্পার ফাংশনস
  const toggleProject = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addManualProject = () => {
    setManualProjects([...manualProjects, { title: "", tech: "", desc: "", live: "", repo: "" }]);
  };

  if (loading) return (
    <div className="h-screen bg-[#05070a] flex flex-col items-center justify-center text-blue-500 font-mono">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <span className="animate-pulse">INITIALIZING_ENGINE...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-gray-300 pb-20 selection:bg-blue-500/30">
      
      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%" }} animate={{ opacity: 1, y: 20, x: "-50%" }} exit={{ opacity: 0, y: -100, x: "-50%" }}
            className="fixed top-0 left-1/2 z-[100] bg-[#161b22]/90 backdrop-blur-xl border border-blue-500/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="bg-blue-500 p-1 rounded-full text-white"><Check size={16} strokeWidth={4} /></div>
            <div className="text-sm font-bold text-white tracking-tight">Database Synced! 🚀</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#05070a]/80 backdrop-blur-xl border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Skill Spring <span className="text-blue-500">Resume</span></h1>
        <div className="flex gap-4">
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#161b22] px-6 py-2.5 rounded-2xl border border-gray-700 hover:bg-gray-800 transition text-sm">
            <Save size={16}/> {saving ? "Saving..." : "Save Data"}
          </button>
          <Link href="/portfolio/preview" target="_blank" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-blue-500 transition text-sm shadow-lg shadow-blue-500/20">
            <Eye size={16}/> View Preview <ArrowRight size={14}/>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 px-6 space-y-10">
        
        {/* Header & Identity Card */}
        <Card title="Header & Contact" icon={<User size={18}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" value={profile.fullName} onChange={v => setProfile({...profile, fullName: v})} />
            <InputField label="Job Title" value={profile.jobTitle} placeholder="e.g. Full-Stack Developer" onChange={v => setProfile({...profile, jobTitle: v})} />
            <InputField label="Phone" value={profile.phone} onChange={v => setProfile({...profile, phone: v})} />
            <InputField label="Location" value={profile.location} onChange={v => setProfile({...profile, location: v})} />
            <InputField label="LinkedIn URL" value={profile.linkedin} onChange={v => setProfile({...profile, linkedin: v})} />
            <InputField label="GitHub URL" value={profile.github} onChange={v => setProfile({...profile, github: v})} />
          </div>
        </Card>

        {/* Objective Card */}
        <Card title="Career Objective" icon={<Briefcase size={18}/>}>
          <textarea 
            className="w-full bg-[#0d1117] border border-gray-800 p-4 rounded-2xl text-sm focus:border-blue-500 outline-none min-h-[120px] text-white"
            value={profile.careerObjective}
            onChange={e => setProfile({...profile, careerObjective: e.target.value})}
          />
        </Card>

        {/* Platform Projects Card */}
        <Card title="Platform Projects" icon={<Globe size={18}/>}>
          <p className="text-[10px] text-gray-500 mb-4 uppercase font-bold tracking-widest italic">Tick projects to include in resume</p>
          <div className="grid grid-cols-1 gap-3">
            {myProjects.length > 0 ? myProjects.map(proj => (
              <div 
                key={proj._id} 
                onClick={() => toggleProject(proj._id)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${selectedIds.includes(proj._id) ? "border-blue-500 bg-blue-500/10" : "border-gray-800 bg-[#0d1117]"}`}
              >
                <div>
                  <p className="font-bold text-white text-sm">{proj.title}</p>
                  <p className="text-xs text-gray-500">{proj.technologies || proj.category}</p>
                </div>
                {selectedIds.includes(proj._id) && <CheckCircle2 size={20} className="text-blue-500" />}
              </div>
            )) : (
              <div className="p-4 border border-dashed border-gray-800 rounded-2xl text-center text-xs text-gray-600">
                No platform projects completed yet.
              </div>
            )}
          </div>
        </Card>

        {/* Manual Projects Card */}
        <Card title="Manual Projects" icon={<Plus size={18}/>}>
          <div className="space-y-6">
            {manualProjects.map((proj, index) => (
              <div key={index} className="p-6 bg-[#05070a] border border-gray-800 rounded-3xl relative space-y-4">
                <button onClick={() => setManualProjects(manualProjects.filter((_, i) => i !== index))} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition">
                  <Trash2 size={16}/>
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Name" value={proj.title} onChange={v => { const n = [...manualProjects]; n[index].title = v; setManualProjects(n); }} />
                  <InputField label="Tech" value={proj.tech} onChange={v => { const n = [...manualProjects]; n[index].tech = v; setManualProjects(n); }} />
                </div>
                <textarea className="w-full bg-[#0d1117] border border-gray-800 p-3 rounded-xl text-xs text-white" placeholder="Description" value={proj.desc} onChange={e => { const n = [...manualProjects]; n[index].desc = e.target.value; setManualProjects(n); }} />
              </div>
            ))}
            <button onClick={addManualProject} className="w-full py-3 border border-dashed border-gray-800 rounded-2xl text-gray-500 hover:text-blue-500 hover:border-blue-500 transition text-[10px] font-bold">
              + ADD CUSTOM PROJECT
            </button>
          </div>
        </Card>

        {/* Education & Extra */}
        <Card title="Education & More" icon={<GraduationCap size={18}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="University" value={profile.education.university} onChange={v => setProfile({...profile, education: {...profile.education, university: v}})} />
            <InputField label="CGPA" value={profile.education.cgpa} onChange={v => setProfile({...profile, education: {...profile.education, cgpa: v}})} />
            <InputField label="Duration" value={profile.education.duration} placeholder="2022 -- 2026" onChange={v => setProfile({...profile, education: {...profile.education, duration: v}})} />
            <InputField label="Achievements" value={profile.achievements.cpProfiles} onChange={v => setProfile({...profile, achievements: {...profile.achievements, cpProfiles: v}})} />
          </div>
        </Card>

      </div>
    </div>
  );
}

// Reusable Components
function Card({ title, icon, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d1117]/60 border border-gray-800 p-8 rounded-[2.5rem]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">{icon}</div>
        <h3 className="text-xs font-black uppercase tracking-[3px] text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest ml-1">{label}</label>
      <input 
        disabled={disabled}
        className={`w-full bg-[#0d1117] border border-gray-800 p-3 rounded-xl text-sm focus:border-blue-500 outline-none text-white transition-all ${disabled ? 'opacity-40' : ''}`}
        value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}