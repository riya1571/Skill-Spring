import Groq from "groq-sdk";
import { connectMongoDB } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json([], { status: 400 });

    // ইমেইল অনুযায়ী সব মেসেজ টাইমস্ট্যাম্প অনুযায়ী সর্ট করে নিয়ে আসা
    const messages = await ChatMessage.find({ userEmail: email }).sort({ timestamp: 1 });
    
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { message, email, history } = await req.json();
    await connectMongoDB();

    // ১. ইউজারের মেসেজ সেভ করা
    await ChatMessage.create({ userEmail: email, role: "user", content: message });

    // ২. ডাটা ক্লিন করা: শুধু role আর content ফিল্টার করে নেওয়া (খুবই জরুরি)
    const cleanedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // ৩. এআই-কে কল করা (ক্লিন করা হিস্ট্রি সহ)
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are the Skill Spring Mentor. Be friendly, give coding tips, and speak in Bengali." 
        },
        ...cleanedHistory, // <--- এখানে ক্লিন করা ডাটা পাঠাচ্ছি
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiResponse = completion.choices[0].message.content;

    // ৪. এআই-এর উত্তর সেভ করা
    await ChatMessage.create({ userEmail: email, role: "assistant", content: aiResponse });

    return NextResponse.json({ role: "assistant", content: aiResponse });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}