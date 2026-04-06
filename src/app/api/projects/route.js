import { connectMongoDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    
    console.log("Saving this data:", data); // এটি তুমি টার্মিনালে দেখছো

    const newProject = await Project.create({
      userEmail: data.userEmail,
      title: data.title,
      category: data.category || data.technologies || "General", // technologies না থাকলে category নেবে
      technologies: data.technologies || "",
      description: data.description || "",
      live: data.live || "#",
      client: data.client || "",
      server: data.server || ""
    });

    return NextResponse.json({ message: "Saved!", project: newProject }, { status: 201 });
  } catch (error) {
    console.error("ACTUAL_DB_ERROR:", error.message); // টার্মিনালে এই এররটা খুঁজবে
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("-----------------------------------------");
    console.log("🔍 এপিআই খুঁজছে এই ইমেইলের জন্য:", email);

    let projects;
    if (email) {
      // ইমেইল দিয়ে ফিল্টার করে খোঁজা
      projects = await Project.find({ userEmail: email.trim().toLowerCase() }).sort({ createdAt: -1 });
      
      // যদি ইমেইল দিয়ে না পাওয়া যায়, তবে একবার সব প্রজেক্ট চেক করি আদেও আছে কি না
      if (projects.length === 0) {
        const all = await Project.find().limit(5);
        console.log("⚠️ ইমেইল দিয়ে কিছু পাওয়া যায়নি, কিন্তু ডাটাবেসে মোট প্রজেক্ট আছে:", all.length);
        if(all.length > 0) console.log("📌 ডাটাবেসে থাকা প্রথম প্রজেক্টের ইমেইল ছিল:", all[0].userEmail);
      }
    } else {
      projects = await Project.find().sort({ createdAt: -1 });
    }

    console.log("✅ ফাইনাল রেজাল্ট কাউন্ট:", projects.length);
    console.log("-----------------------------------------");

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET_ERROR:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}