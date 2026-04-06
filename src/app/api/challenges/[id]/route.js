import { connectMongoDB } from "@/lib/mongodb";
import Challenge from "@/models/Challenge";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    
    // params থেকে id টা নেওয়া হচ্ছে
    const { id } = await params;
    const challenge = await Challenge.findById(id);
    
    if (!challenge) {
      return NextResponse.json({ message: "Challenge not found" }, { status: 404 });
    }
    
    return NextResponse.json(challenge, { status: 200 });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}