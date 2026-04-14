import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Application from "@/models/Application";
import User from "@/models/User"; 
import Task from "@/models/Task";

export const dynamic = "force-dynamic";

// ১. GET মেথড: পপুলেট এবং পেজিনেশন
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments();
    const applications = await Application.find()
      .populate('userId', 'name email bankDetails')
      .populate('tasks', 'title price difficulty company') // tasks ফিল্ড পপুলেট হচ্ছে
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      applications, 
      totalPages: Math.ceil(total / limit) 
    }, { status: 200 });

  } catch (error) {
    console.error("ADMIN_GET_ERROR:", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}

// ২. PATCH মেথড: স্ট্যাটাস এবং ফিডব্যাক আপডেট
export async function PATCH(req) {
  try {
    await connectMongoDB();
    const { applicationId, status, feedback } = await req.json();

    if (!applicationId) {
      return NextResponse.json({ message: "Application ID is required" }, { status: 400 });
    }

    const updateData = { status };
    if (feedback) updateData.adminFeedback = feedback;

    const updatedApp = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { returnDocument: 'after' } // 'new: true' এর বদলে এটা দিলে টার্মিনাল ওয়ার্নিং চলে যাবে
    );

    return NextResponse.json({ 
      message: `Status updated to ${status}`, 
      application: updatedApp 
    }, { status: 200 });

  } catch (error) {
    console.error("ADMIN_PATCH_ERROR:", error);
    return NextResponse.json({ message: "Error updating status" }, { status: 500 });
  }
}