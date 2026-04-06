import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { code, challengeTitle, expectedOutput } = await req.json();

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are "Skill Spring AI Mentor". Your goal is to review code fairly but strictly.
          
          RULES:
          1. If the user's code logically fulfills the goal: "${expectedOutput}", return status: "success".
          2. If the code is wrong, incomplete, or unrelated, return status: "error".
          3. IMPORTANT: If the status is "error", you MUST provide a property called "correctSolution" containing the ideal code to solve this challenge.
          4. Provide feedback in Bengali (max 2 sentences) in the "text" property.
          
          RESPONSE FORMAT (JSON):
          {
            "status": "success" or "error",
            "text": "Bengali feedback here",
            "correctSolution": "The full correct code string (ONLY if status is error, else null)"
          }`
        },
        {
          role: "user",
          content: `Challenge: "${challengeTitle}"\nExpected Output: "${expectedOutput}"\nUser's Code:\n\`\`\`javascript\n${code}\n\`\`\``
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { status: "error", text: "এআই মেন্টর এখন কোড চেক করতে পারছে না।", correctSolution: null },
      { status: 500 }
    );
  }
}