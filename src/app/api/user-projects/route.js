import { connectMongoDB } from "@/lib/mongodb";
import Project from "@/models/Project"; // নিশ্চিত হও এই মডেলটি তোমার আছে
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    // ইউজারের ইমেইল অনুযায়ী তার করা প্রজেক্টগুলো খুঁজে বের করা
    const projects = await Project.find({ userEmail: email }).sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}