import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Project from "@/models/Project";

// ১. ডাটা রিড করা (GET)
export async function GET(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const projects = await Project.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await Project.countDocuments();

        return NextResponse.json({
            projects,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch projects" }, { status: 500 });
    }
}

// ২. নতুন প্রজেক্ট তৈরি করা (POST)
export async function POST(req) {
    try {
        const data = await req.json();
        await connectMongoDB();
        const newProject = await Project.create(data);
        return NextResponse.json({ message: "Project Created Successfully", newProject }, { status: 201 });
    } catch (error) {
        console.error("Project Create Error:", error);
        return NextResponse.json({ message: "Failed to create project" }, { status: 500 });
    }
}

// ৩. প্রজেক্ট আপডেট করা (PUT)
export async function PUT(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ message: "Project ID is required" }, { status: 400 });

        const data = await req.json();
        await connectMongoDB();
        const updatedProject = await Project.findByIdAndUpdate(id, data, { new: true });
        
        return NextResponse.json({ message: "Project Updated Successfully", updatedProject }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update project" }, { status: 500 });
    }
}

// ৪. প্রজেক্ট ডিলিট করা (DELETE)
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ message: "Project ID is required" }, { status: 400 });

        await connectMongoDB();
        await Project.findByIdAndDelete(id);
        return NextResponse.json({ message: "Project Deleted Successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete project" }, { status: 500 });
    }
}