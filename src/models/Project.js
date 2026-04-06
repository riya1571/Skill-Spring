import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  userEmail: { 
    type: String, 
    required: true,
    index: true // খোঁজার সুবিধার জন্য ইনডেক্স করে দিলাম
  },
  title: { type: String, required: true },
  category: { type: String, default: "Web Development" },
  technologies: String,
  description: String,
  live: { type: String, default: "#" },
  client: { type: String, default: "" },
  server: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

// মডেলে যেন ডুপ্লিকেট না হয় তাই এই লাইনটি জরুরি
export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);