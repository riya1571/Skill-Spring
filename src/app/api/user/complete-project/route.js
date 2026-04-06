import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import { NextResponse } from "next/server";

export async function POST(req) { // <--- এটা অবশ্যই বড় হাতের POST হতে হবে
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized - Please log in" }, { status: 401 });
    }

    const { projectId } = await req.json();
    await connectMongoDB();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $addToSet: { completedProjects: projectId }, 
        $inc: { points: 50 } 
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found in DB" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project marked as completed!", points: user.points }, { status: 200 });
    
  } catch (error) {
    console.error("Complete Project API Error:", error);
    return NextResponse.json({ message: "Failed to save progress", error: error.message }, { status: 500 });
  }
}