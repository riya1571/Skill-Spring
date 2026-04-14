import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Task from "@/models/Task";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();

    // ১. প্রথমে পুরনো সব ডাটা ডিলিট করে দেওয়া হচ্ছে
    await Task.deleteMany({});

    // ২. নতুন ৮টি প্রিমিয়াম টাস্ক (সঠিক price ফিল্ডসহ)
    const freshTasks = [
      {
        title: "E-commerce Admin Dashboard Optimization",
        company: "TechNova Solutions",
        description: "Next.js এবং Tailwind ব্যবহার করে একটি স্লো ড্যাশবোর্ডকে অপ্টিমাইজ করতে হবে। সার্ভার কম্পোনেন্ট ব্যবহার করা বাধ্যতামূলক।",
        price: 120, 
        difficulty: "Medium",
        tags: ["Next.js", "Tailwind", "Recharts"],
        deadline: "5 Days",
        status: "Open"
      },
      {
        title: "Real-time Messaging System with Socket.io",
        company: "ChatSync Inc.",
        description: "একটি রিয়েল-টাইম চ্যাট অ্যাপ্লিকেশন বানাতে হবে যেখানে মেসেজ ক্যাশিংয়ের জন্য Redis ব্যবহার করতে হবে।",
        price: 150,
        difficulty: "Hard",
        tags: ["React", "Socket.io", "Redis"],
        deadline: "3 Days",
        status: "Open"
      },
      {
        title: "Stripe Subscription Payment Integration",
        company: "SaaS Launchpad",
        description: "একটি SaaS প্ল্যাটফর্মের জন্য মান্থলি এবং ইয়ারলি সাবস্ক্রিপশন সিস্টেম বানাতে হবে Stripe API ব্যবহার করে।",
        price: 100,
        difficulty: "Medium",
        tags: ["Stripe", "Node.js", "Express"],
        deadline: "7 Days",
        status: "Open"
      },
      {
        title: "AI Resume Parser using OpenAI",
        company: "PersonaCV AI",
        description: "PDF রেজুমি থেকে ডাটা এক্সট্রাক্ট করে JSON ফরমেটে কনভার্ট করার একটি এপিআই ফাংশন লিখতে হবে।",
        price: 200,
        difficulty: "Expert",
        tags: ["OpenAI", "Next.js", "Python"],
        deadline: "10 Days",
        status: "Open"
      },
      {
        title: "Full-stack Authentication System (RBAC)",
        company: "SecureGate",
        description: "Next-Auth ব্যবহার করে রোল-বেসড এক্সেস কন্ট্রোল সিস্টেম বানাতে হবে (Admin, Moderator, User)।",
        price: 85,
        difficulty: "Medium",
        tags: ["Next-Auth", "MongoDB", "Auth"],
        deadline: "4 Days",
        status: "Open"
      },
      {
        title: "Dockerizing a Multi-service MERN App",
        company: "DevOps Masters",
        description: "একটি এক্সিসটিং MERN প্রজেক্টের জন্য Docker-compose ফাইল লিখতে হবে এবং প্রোডাকশন এনভায়রনমেন্ট সেটআপ করতে হবে।",
        price: 130,
        difficulty: "Hard",
        tags: ["Docker", "Nginx", "DevOps"],
        deadline: "5 Days",
        status: "Open"
      },
      {
        title: "GraphQL API for Inventory Management",
        company: "StockFlow",
        description: "REST এর বদলে Apollo Server ব্যবহার করে একটি ইনভেন্টরি ম্যানেজমেন্ট সিস্টেমের গ্রাফ-কিউএল এপিআই বানাতে হবে।",
        price: 110,
        difficulty: "Medium",
        tags: ["GraphQL", "Apollo", "Node.js"],
        deadline: "6 Days",
        status: "Open"
      },
      {
        title: "Responsive Portfolio with 3D Elements",
        company: "Creative Studio",
        description: "Three.js ব্যবহার করে একটি সুপার কুল এবং রেসপন্সিভ থ্রি-ডি পোর্টফোলিও ল্যান্ডিং পেজ বানাতে হবে।",
        price: 180,
        difficulty: "Expert",
        tags: ["Three.js", "React", "Framer Motion"],
        deadline: "12 Days",
        status: "Open"
      }
    ];

    // ৩. নতুন ডাটা পুশ করা
    await Task.insertMany(freshTasks);

    return NextResponse.json({ 
      message: "Database Cleared and Seeded with 8 Fresh Tasks!", 
      success: true 
    }, { status: 201 });

  } catch (error) {
    console.error("SEED_ERROR:", error);
    return NextResponse.json({ message: "Failed to reset database", error: error.message }, { status: 500 });
  }
}