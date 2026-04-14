import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true }, // কে টাস্ক দিয়েছে
    description: { type: String, required: true },
    //reward: { type: String, required: true }, // যেমন: $50 বা 500 XP
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Expert"], default: "Medium" },
    tags: [{ type: String }], // যেমন: ["React", "Next.js", "Tailwind"]
    status: { type: String, enum: ["Open", "In Progress", "Completed"], default: "Open" },
    deadline: { type: String },
    price: { type: Number, required: true }, // Dollar amount
assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;