import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { email, bankDetails } = await req.json();

    if (!email || !bankDetails) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // ইউজারকে আপডেট করা এবং ভেরিফাইড করে দেওয়া
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { 
        $set: { 
          bankDetails, 
          isVerified: true 
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile Verified Successfully!" }, { status: 200 });

  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}