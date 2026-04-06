const mongoose = require("mongoose");

// তোমার দেওয়া অরিজিনাল ইউআরএল সরাসরি এখানে বসিয়ে দিলাম
const MONGODB_URI = "mongodb+srv://skill-spring:iEPe6Qo9XzDjzPdZ@cluster0.umszehx.mongodb.net/skillspring?appName=Cluster0"; 

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  difficulty: String,
  tags: [String],
  tasksCount: Number
});

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

const sampleProjects = [
  {
    title: "NGO Donation Tracker",
    description: "একটি ছোট এনজিওর জন্য ডোনেশন ট্র্যাকিং সিস্টেম তৈরি করুন যেখানে তারা তাদের দাতাদের লিস্ট এবং অনুদান ম্যানেজ করতে পারবে।",
    category: "Web Development",
    difficulty: "Beginner",
    tags: ["React", "Node.js", "MongoDB"],
    tasksCount: 5
  },
  {
    title: "Small Business Inventory Manager",
    description: "একটি স্থানীয় দোকানের জন্য স্টক ম্যানেজমেন্ট অ্যাপ তৈরি করুন যা তাদের কেনা-বেচার হিসাব রাখবে।",
    category: "Software Engineering",
    difficulty: "Intermediate",
    tags: ["Next.js", "Tailwind CSS", "Prisma"],
    tasksCount: 8
  },
  {
    title: "Charity Event Landing Page",
    description: "একটি চ্যারিটি ইভেন্টের জন্য রেসপন্সিভ ল্যান্ডিং পেজ তৈরি করুন যেখানে ইভেন্ট ডিটেইলস এবং রেজিস্ট্রেশন ফর্ম থাকবে।",
    category: "Frontend Development",
    difficulty: "Beginner",
    tags: ["HTML", "CSS", "JavaScript"],
    tasksCount: 3
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected! Clearing old data...");
    await Project.deleteMany({}); 
    console.log("Inserting new projects...");
    await Project.insertMany(sampleProjects);
    console.log("Database Seeded Successfully! 🚀");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();