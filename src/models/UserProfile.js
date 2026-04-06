import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  fullName: String,
  jobTitle: String, // যেমন: Full-Stack Developer (MERN)
  phone: String,
  location: String,
  linkedin: String,
  github: String,
  portfolio: String,
  careerObjective: String,
  skills: {
    languages: String,
    frontend: String,
    backend: String,
    databases: String,
    interpersonal: String,
  },
  education: {
    university: String,
    degree: String,
    duration: String,
    cgpa: String,
  },
  achievements: {
    icpc: String,
    uta: String,
    problemSetter: String,
    cpProfiles: String,
  },
  languagesKnown: String, // Bengali, English etc.
});

export default mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);