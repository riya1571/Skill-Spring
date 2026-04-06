import { connectMongoDB } from "@/lib/mongodb";
import Challenge from "@/models/Challenge";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();
    
    // আগে থেকে থাকলে ডিলিট করে নতুন করে বসাচ্ছে (যাতে ডুপ্লিকেট না হয়)
    await Challenge.deleteMany({});
    
    await Challenge.insertMany([
      {
        title: "Fix the Login Bug",
        description: "Next.js Authentication এর একটি ভাঙা কোড দেওয়া আছে। আপনাকে বাগটি খুঁজে বের করে ফিক্স করতে হবে।",
        points: 100,
        difficulty: "Intermediate",
        timeLeft: "2 Days Left",
        participants: 12,
        tags: ["NextAuth", "Debugging"],
        expectedOutput: "User should be redirected to /dashboard after successful login."
      },
      {
        title: "Build a CSS Loader",
        description: "শুধুমাত্র HTML এবং CSS ব্যবহার করে একটি ক্রিয়েটিভ লোডিং অ্যানিমেশন তৈরি করুন।",
        points: 50,
        difficulty: "Beginner",
        timeLeft: "5 Hours Left",
        participants: 34,
        tags: ["CSS3", "Animation"],
        expectedOutput: "A rotating spinner using @keyframes without any JavaScript."
      }
    ]);

    return NextResponse.json({ message: "Challenges inserted successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to insert" }, { status: 500 });
  }
}