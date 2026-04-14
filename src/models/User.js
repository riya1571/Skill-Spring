import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    
    // নতুন যুক্ত করা লগইন ফিল্ডস
    password: { type: String }, // গুগল লগইনের জন্য এটি ফাঁকা থাকতে পারে
    role: { type: String, default: "user" },
    
    // তোমার আগের ফিল্ডস
    image: { type: String },
    points: { type: Number, default: 0 }, // ইউজারের বর্তমান পয়েন্ট
    completedProjects: [{ type: String }], // সাবমিট করা প্রজেক্টের আইডিগুলো এখানে থাকবে
    // Verification field add korte hobe
isVerified: { type: Boolean, default: false },
bankDetails: {
  accountName: String,
  accountNumber: String,
  bankName: String,
  routingNumber: String,
  role: { type: String, default: "user" }
},
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;