import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Challenge from "@/models/Challenge";

// ১. ডাটা রিড করা (GET)
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const challenges = await Challenge.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await Challenge.countDocuments();

        return NextResponse.json({
            challenges,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch challenges" }, { status: 500 });
    }
}

// ২. নতুন চ্যালেঞ্জ তৈরি করা (POST)
export async function POST(req) {
    try {
        const data = await req.json();
        await connectMongoDB();
        const newChallenge = await Challenge.create(data);
        return NextResponse.json({ message: "Challenge Created Successfully", newChallenge }, { status: 201 });
    } catch (error) {
        console.error("Challenge Create Error:", error);
        return NextResponse.json({ message: "Failed to create challenge" }, { status: 500 });
    }
}

// ৩. চ্যালেঞ্জ আপডেট করা (PUT)
export async function PUT(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ message: "Challenge ID is required" }, { status: 400 });

        const data = await req.json();
        await connectMongoDB();
        const updatedChallenge = await Challenge.findByIdAndUpdate(id, data, { new: true });
        
        return NextResponse.json({ message: "Challenge Updated Successfully", updatedChallenge }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update challenge" }, { status: 500 });
    }
}

// ৪. চ্যালেঞ্জ ডিলিট করা (DELETE)
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ message: "Challenge ID is required" }, { status: 400 });

        await connectMongoDB();
        await Challenge.findByIdAndDelete(id);
        return NextResponse.json({ message: "Challenge Deleted Successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete challenge" }, { status: 500 });
    }
}