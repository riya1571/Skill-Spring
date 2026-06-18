import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  tags: [{ type: String }],
  tasksCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", projectSchema);