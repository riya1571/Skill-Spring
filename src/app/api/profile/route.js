import { connectMongoDB } from "@/lib/mongodb";
import UserProfile from "@/models/UserProfile";
import { NextResponse } from "next/server";

// ১. প্রোফাইল ডাটা নিয়ে আসা
export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    let profile = await UserProfile.findOne({ userEmail: email });
    
    // যদি প্রোফাইল না থাকে, তবে একটি ডিফল্ট অবজেক্ট পাঠানো
    if (!profile) {
      return NextResponse.json({ isNew: true });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ২. প্রোফাইল ডাটা আপডেট বা নতুন সেভ করা
export async function POST(req) {
  try {
    const data = await req.json();
    await connectMongoDB();

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userEmail: data.userEmail },
      { ...data, lastUpdated: Date.now() },
      { upsert: true, new: true } // যদি না থাকে তবে তৈরি করবে (Upsert)
    );

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}