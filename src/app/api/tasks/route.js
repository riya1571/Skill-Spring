import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Task from "@/models/Task";

export const dynamic = "force-dynamic"; 

// --- আপডেটেড GET মেথড (Pagination সহ) ---
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    
    // পেজিনেশনের লজিক (ডিফল্ট পেজ ১, প্রতি পেজে ৫টা টাস্ক)
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 5; 
    const skip = (page - 1) * limit;

    // ডাটাবেস থেকে টোটাল টাস্ক কয়টি আছে সেটা গোনা
    const total = await Task.countDocuments();
    
    // লিমিট এবং স্কিপ ব্যবহার করে শুধু ওই পেজের ৫টা ডাটা আনা
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ফ্রন্টএন্ডে ডাটার সাথে টোটাল পেজ নাম্বারও পাঠিয়ে দেওয়া হচ্ছে
    return NextResponse.json({ 
      tasks, 
      totalPages: Math.ceil(total / limit),
      currentPage: page 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch tasks" }, { status: 500 });
  }
}

// --- POST মেথড (নতুন টাস্ক অ্যাড করার জন্য) ---
export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    const newTask = await Task.create(data);
    return NextResponse.json({ message: "Task created successfully!", task: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create task", error: error.message }, { status: 500 });
  }
}

// --- DELETE মেথড (টাস্ক ডিলিট করার জন্য) ---
export async function DELETE(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Task ID is required" }, { status: 400 });

    await Task.findByIdAndDelete(id);
    return NextResponse.json({ message: "Task deleted successfully!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete task" }, { status: 500 });
  }
}