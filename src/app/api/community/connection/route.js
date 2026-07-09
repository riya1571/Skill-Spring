import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Connection from "@/models/Connection";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId, action } = await req.json(); // action: "send", "accept", "reject"

    if (!targetUserId || !action) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectMongoDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Find if a connection already exists
    let connection = await Connection.findOne({
      $or: [
        { sender: currentUser._id, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUser._id }
      ]
    });

    if (action === "send") {
      if (connection) {
        return NextResponse.json({ message: "Connection already exists" }, { status: 400 });
      }
      connection = await Connection.create({
        sender: currentUser._id,
        receiver: targetUserId,
        status: "pending"
      });
      return NextResponse.json({ message: "Request sent successfully", connection });
    }

    if (action === "accept" || action === "reject") {
      if (!connection) {
        return NextResponse.json({ message: "No request found" }, { status: 404 });
      }
      
      // Ensure only the receiver can accept/reject
      if (connection.receiver.toString() !== currentUser._id.toString()) {
        return NextResponse.json({ message: "Unauthorized action" }, { status: 403 });
      }

      connection.status = action === "accept" ? "accepted" : "rejected";
      await connection.save();
      
      return NextResponse.json({ message: `Request ${action}ed successfully`, connection });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Error managing connection:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
