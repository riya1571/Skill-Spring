import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    points: { type: Number, default: 0 }, // ইউজারের বর্তমান পয়েন্ট
    completedProjects: [{ type: String }], // সাবমিট করা প্রজেক্টের আইডিগুলো এখানে থাকবে
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;