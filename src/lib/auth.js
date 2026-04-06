import GoogleProvider from "next-auth/providers/google";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          const { name, email, image } = user;
          await connectMongoDB();
          
          // ডাটাবেসে ইউজার আছে কি না চেক করো
          const userExists = await User.findOne({ email });
          
          // যদি না থাকে, তবে নতুন করে সেভ করো
          if (!userExists) {
            await User.create({
              name,
              email,
              image,
              points: 0,
              completedProjects: []
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user", error);
          return false;
        }
      }
      return true; 
    },
  },
};