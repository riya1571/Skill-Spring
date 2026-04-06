import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Success!", points: user.points }, { status: 200 });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Failed", error: error.message }, { status: 500 });
  }
}
// টেস্ট করার জন্য এই ফাংশনটা যোগ করো
export async function GET() {
  return NextResponse.json({ message: "Yes, API is working perfectly!" });
}