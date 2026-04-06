import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // নতুন ফাইল থেকে আনছি

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };