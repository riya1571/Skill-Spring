import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Connection from "@/models/Connection";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const currentUser = await User.findOne({ email: session.user.email }).lean();
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch all users except the current user
    const otherUsers = await User.find({ _id: { $ne: currentUser._id } }).select("name image points _id").lean();

    // Fetch all connections involving the current user
    const connections = await Connection.find({
      $or: [{ sender: currentUser._id }, { receiver: currentUser._id }],
    }).lean();

    // Map connection status to users
    const usersWithStatus = otherUsers.map((user) => {
      const connection = connections.find(
        (c) => c.sender.toString() === user._id.toString() || c.receiver.toString() === user._id.toString()
      );

      let connectionStatus = "none";
      let connectionId = null;

      if (connection) {
        connectionId = connection._id;
        if (connection.status === "accepted") {
          connectionStatus = "accepted";
        } else if (connection.status === "rejected") {
          connectionStatus = "rejected";
        } else if (connection.sender.toString() === currentUser._id.toString()) {
          connectionStatus = "pending_sent";
        } else {
          connectionStatus = "pending_received";
        }
      }

      return {
        ...user,
        connectionStatus,
        connectionId
      };
    });

    return NextResponse.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching community users:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
