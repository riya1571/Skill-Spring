import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    difficulty: { type: String, required: true }, // Beginner, Intermediate, Advanced
    timeLeft: { type: String, default: "2 Days Left" },
    participants: { type: Number, default: 0 },
    tags: [{ type: String }],
    expectedOutput: { type: String }, // অটো-রিভিউর সময় AI এটা চেক করবে
  },
  { timestamps: true }
);

const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", challengeSchema);
export default Challenge;