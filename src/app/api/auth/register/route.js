import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // ১. ভ্যালিডেশন চেক (যদি কোনো ফিল্ড খালি থাকে)
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields (Name, Email, Password) are required." },
        { status: 400 }
      );
    }

    // ২. ডাটাবেস কানেকশন
    await connectMongoDB();

    // ৩. ইউজার অলরেডি আছে কি না চেক করা
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 }
      );
    }

    // ৪. পাসওয়ার্ড হ্যাশ করা (সিকিউরিটির জন্য)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ৫. নতুন ইউজার তৈরি (ডিফল্ট রোল "user" হিসেবে)
    await User.create({ 
        name, 
        email, 
        password: hashedPassword,
        role: "user", // এখানে ডিফল্ট রোল সেট করা হলো
        points: 0,
        completedProjects: []
    });

    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });

  } catch (error) {
    console.error("REGISTRATION_ERROR:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}