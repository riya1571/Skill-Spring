"use client";
import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useSession } from "next-auth/react";
import { useReactToPrint } from "react-to-print";
import { Download, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ResumePreview() {
  const { data: session } = useSession();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const resumeRef = useRef();

  // useEffect এর ভেতর প্রজেক্ট ফিল্টার লজিক যোগ করো:
useEffect(() => {
  if (session?.user?.email) {
    const load = async () => {
      // ১. প্রোফাইল ডাটা ফেচ
      const profRes = await fetch(`/api/profile?email=${session.user.email}`);
      const profData = await profRes.json();
      setData(profData);
      
      // ২. সব প্রজেক্ট ফেচ
      const projRes = await fetch(`/api/user-projects?email=${session.user.email}`);
      const allProjects = await projRes.json();
      
      // ৩. ফিল্টার লজিক: শুধু যেগুলোতে টিক দেওয়া হয়েছে সেগুলোই দেখাবে
      if (profData.selectedProjectIds && profData.selectedProjectIds.length > 0) {
        const filtered = allProjects.filter(p => profData.selectedProjectIds.includes(p._id));
        setProjects(filtered);
      } else {
        // যদি কোনো টিক দেওয়া না থাকে তবে ম্যানুয়াল প্রজেক্ট থাকলে সেগুলো দেখাবে
        setProjects(profData.manualProjects || []);
      }
      setLoading(false);
    };
    load();
  }
}, [session]);

  const handlePrint = useReactToPrint({ 
    contentRef: resumeRef, 
    documentTitle: data?.fullName ? `${data.fullName}_Resume` : "Resume" 
  });

  if (loading) return (
    <div className="h-screen bg-[#05070a] flex flex-col items-center justify-center text-blue-500 font-mono">
      <Loader2 className="animate-spin mb-4" size={40} />
      <span>PREPARING_RESUME_VIEW...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111418] p-4 md:p-10 flex flex-col items-center">
      
      {/* Floating Controls */}
      <div className="fixed bottom-10 flex gap-4 z-50">
        <Link href="/portfolio" className="bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-gray-700 flex items-center gap-2 hover:bg-gray-800 transition shadow-2xl">
          <ChevronLeft size={18}/> Back to Editor
        </Link>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500 transition shadow-2xl shadow-blue-500/30">
          <Download size={18}/> Download PDF
        </button>
      </div>

      {/* The Resume Paper */}
      <div className="bg-white shadow-[0_0_100px_rgba(0,0,0,0.6)] mb-24 overflow-hidden border border-gray-100">
        <ResumeTemplate ref={resumeRef} profile={data} projects={projects} />
      </div>

    </div>
  );
}

// LaTeX Template Component - Robust Version
const ResumeTemplate = forwardRef(({ profile, projects }, ref) => (
  <div ref={ref} className="bg-white text-black p-[0.5in] md:p-[0.6in] font-serif leading-tight w-[8.5in] min-h-[11in] mx-auto text-[10.5pt]">
    <style>{`
      @media print { @page { margin: 0; size: letter; } }
      .stitle { font-size: 11.5pt; font-weight: bold; text-transform: uppercase; border-bottom: 0.8pt solid black; margin-top: 14pt; margin-bottom: 6pt; padding-bottom: 2pt; }
      .bold { font-weight: bold; }
      ul { padding-left: 16pt; margin: 4pt 0; }
      li { list-style-type: none; position: relative; font-size: 10pt; margin-bottom: 3pt; text-align: justify; line-height: 1.4; }
      li::before { content: "--"; position: absolute; left: -12pt; }
      .placeholder { color: #999; font-style: italic; }
    `}</style>

    {/* Header Section */}
    <div className="text-center mb-8">
      <h1 className="text-[22pt] bold uppercase mb-1">
        {profile?.fullName || <span className="placeholder">YOUR FULL NAME</span>}
      </h1>
      <p className="italic text-[11pt] mb-2">
        {profile?.jobTitle || <span className="placeholder">Software Engineer (MERN)</span>}
      </p>
      <div className="text-[10pt] text-gray-800">
        {profile?.phone || "01XXX-XXXXXX"} | {profile?.userEmail || "email@example.com"} | {profile?.location || "City, Bangladesh"}
      </div>
      <div className="text-[10pt] mt-2 space-x-2 font-medium text-blue-700">
        <span className="underline">LinkedIn</span> • <span className="underline">GitHub</span> • <span className="underline">Portfolio</span>
      </div>
    </div>

    {/* Career Objective */}
    <div className="stitle">Career Objective</div>
    <p className="text-justify text-[10.2pt] leading-relaxed">
      {profile?.careerObjective || <span className="placeholder">Motivated developer seeking an opportunity to contribute to a dynamic engineering team...</span>}
    </p>

    {/* Technical Skills */}
    <div className="stitle">Technical Skills</div>
    <div className="text-[10pt] space-y-1.5 mt-2">
      <p><span className="bold">Languages:</span> {profile?.skills?.languages || <span className="placeholder">C++, JavaScript, Python...</span>}</p>
      <p><span className="bold">Frontend:</span> {profile?.skills?.frontend || <span className="placeholder">React.js, Next.js, Tailwind CSS...</span>}</p>
      <p><span className="bold">Backend:</span> {profile?.skills?.backend || <span className="placeholder">Node.js, Express.js, MongoDB...</span>}</p>
    </div>

    {/* Key Projects */}
    <div className="stitle">Key Projects</div>
    {(projects && projects.length > 0) ? projects.slice(0, 4).map((p, i) => (
      <div key={i} className="mb-4">
        <div className="flex justify-between bold text-[10.5pt]">
          <span>{p?.title || "Project Name"}</span>
          <div className="flex gap-2 text-[9pt] underline text-blue-700">
             <span>Live</span> | <span>Source</span>
          </div>
        </div>
        <div className="italic text-[9.5pt] text-gray-700 mt-0.5">{p?.technologies || "Tech Stack Used"}</div>
        <ul>
          <li>{p?.description || "Designed and implemented scalable application architecture with modern technologies."}</li>
        </ul>
      </div>
    )) : (
      <div className="placeholder text-sm">No projects added yet. Use the editor to select or add projects.</div>
    )}

    {/* Education */}
    <div className="stitle">Education</div>
    <div className="flex justify-between bold text-[10.5pt]">
      <span>{profile?.education?.university || <span className="placeholder">University Name</span>}</span>
      <span>Dhaka, BD</span>
    </div>
    <div className="flex justify-between text-[10pt] mt-1">
      <span>{profile?.education?.degree || "Bachelor of Science in CSE"}</span>
      <span>{profile?.education?.duration || "2022 -- 2026"}</span>
    </div>
    <p className="text-[10pt] font-medium">CGPA: {profile?.education?.cgpa || "0.00"}</p>
  </div>
));

ResumeTemplate.displayName = "ResumeTemplate";