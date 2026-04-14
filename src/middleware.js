// src/middleware.js
export { default } from "next-auth/middleware";

// এখানে বলে দাও কোন পেজগুলোতে লগইন ছাড়া ঢোকা নিষেধ
export const config = {
  matcher: [
    "/portfolio/:path*", // পোর্টফোলিও এবং তার ভেতরের সব পেজ
    "/projects/:path*",  // প্রজেক্টের সব পেজ
    "/dashboard/:path*", // ড্যাশবোর্ড (যদি থাকে)
  ],
};