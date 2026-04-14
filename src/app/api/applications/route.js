import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Application from "@/models/Application";
import User from "@/models/User";

// নতুন কাজের জন্য অ্যাপ্লাই করা
export async function POST(req) {
  try {
    await connectMongoDB();
    const { userEmail, taskId } = await req.json();

    // ১. ইউজারকে ডাটাবেসে খোঁজা
    const user = await User.findOne({ email: userEmail });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // ২. প্রোফাইল ভেরিফিকেশন চেক (ব্যাংক ডিটেইলস আছে কি না)
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your profile first.", notVerified: true }, 
        { status: 403 }
      );
    }

    // ৩. চেক করা সে আগে থেকেই অ্যাপ্লাই করেছে কি না
    const existingApp = await Application.findOne({ userId: user._id, taskId });
    if (existingApp) {
      return NextResponse.json({ message: "You have already applied for this task." }, { status: 400 });
    }

    // ৪. অ্যাপ্লিকেশন সেভ করা
    const newApplication = await Application.create({
      userId: user._id,
      tasks: taskId,
      status: "applied"
    });

    return NextResponse.json({ message: "Application submitted successfully!" }, { status: 201 });

  } catch (error) {
    console.error("APP_POST_ERROR:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// ইউজারের সব অ্যাপ্লিকেশন দেখা (যাতে বাটন স্ট্যাটাস চেঞ্জ করা যায়)
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json([]);

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json([]);

    const applications = await Application.find({ userId: user._id });
    return NextResponse.json(applications, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
// ... তোমার আগের POST এবং GET মেথডগুলো এখানে থাকবে ...

// ইউজারের প্রজেক্ট সাবমিট করা
export async function PATCH(req) {
  try {
    await connectMongoDB();
    const { applicationId, liveLink, clientRepo, serverRepo } = await req.json();

    const updatedApp = await Application.findByIdAndUpdate(
      applicationId,
      {
        status: "submitted",
        submission: {
          liveLink,
          clientRepo,
          serverRepo,
          submittedAt: new Date()
        }
      },
      { new: true }
    );

    return NextResponse.json({ message: "Work submitted successfully!" }, { status: 200 });

  } catch (error) {
    console.error("APP_SUBMIT_ERROR:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}