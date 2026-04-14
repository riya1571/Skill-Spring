import { withAuth } from "next-auth/middleware";

// এই ফাংশনটি এক্সপ্লিসিটলি এক্সপোর্ট করা হলো যাতে নেক্সট জেএস চিনতে পারে
export default withAuth({
  pages: {
    signIn: "/login", // ইউজার লগইন না থাকলে এই পেজে পাঠাবে
  },
});

// এখানে তোমার সব সিকিউর রুটগুলো বলে দাও
export const config = {
  matcher: [
    "/admin/:path*",      // অ্যাডমিন প্যানেল প্রটেক্ট করা হলো
    "/portfolio/:path*",  
    "/projects/:path*",   
    "/dashboard/:path*",
  ],
};