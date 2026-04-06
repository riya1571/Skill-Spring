import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);