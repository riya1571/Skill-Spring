import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs"; // bcryptjs ইমপোর্ট নিশ্চিত করো

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        await connectMongoDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error("No user found with this email");
        
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordsMatch) throw new Error("Incorrect password");

        // ইউজারের আইডি এবং রোল অবজেক্টে রিটার্ন করা হচ্ছে
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user", // ডাটাবেস থেকে রোল নেওয়া হচ্ছে
        };
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // ১. সাইন ইন হওয়ার সময় লজিক (Google এর জন্য)
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          const { name, email, image } = user;
          await connectMongoDB();
          
          const userExists = await User.findOne({ email });
          
          if (!userExists) {
            await User.create({
              name,
              email,
              image,
              role: "user", // নতুন গুগোল ইউজারের ডিফল্ট রোল "user"
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

    // ২. JWT টোকেনে রোল এবং আইডি অ্যাড করা
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // এখানে রোল টোকেনে সেভ হচ্ছে
      }
      return token;
    },

    // ৩. সেশনে টোকেন থেকে ডাটা পাঠানো (যাতে ফ্রন্টএন্ডে session.user.role পাওয়া যায়)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role; // ফ্রন্টএন্ড সেশনে রোল পাঠানো হলো
      }
      return session;
    },
  },
};