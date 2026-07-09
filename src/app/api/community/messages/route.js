import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Connection from "@/models/Connection";
import Message from "@/models/Message";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

// Fetch chat history for a specific connection
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const connectionId = url.searchParams.get("connectionId");

    if (!connectionId) return NextResponse.json({ message: "Missing connectionId" }, { status: 400 });

    await connectMongoDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Verify connection exists and is accepted, and belongs to this user
    const connection = await Connection.findById(connectionId);
    if (!connection || connection.status !== "accepted") {
      return NextResponse.json({ message: "Invalid or unauthorized connection" }, { status: 403 });
    }

    if (connection.sender.toString() !== currentUser._id.toString() && connection.receiver.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });
    }

    const messages = await Message.find({ connectionId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ messages, currentUserId: currentUser._id });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Send a new message
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { connectionId, text } = await req.json();

    if (!connectionId || !text) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    await connectMongoDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Verify connection
    const connection = await Connection.findById(connectionId);
    if (!connection || connection.status !== "accepted") {
      return NextResponse.json({ message: "Cannot send message. Connection not accepted." }, { status: 403 });
    }

    if (connection.sender.toString() !== currentUser._id.toString() && connection.receiver.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });
    }

    // Save message to DB
    const newMessage = await Message.create({
      connectionId,
      sender: currentUser._id,
      text,
    });

    // Trigger Pusher event
    await pusherServer.trigger(`chat-${connectionId}`, "new-message", newMessage);

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
