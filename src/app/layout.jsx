import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Skill Spring - AI Learning Platform",
  description: "Learn by building real projects with an AI Mentor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        {/* AuthProvider দিয়ে পুরো অ্যাপ র‍্যাপ করা হলো */}
        <AuthProvider>
          <SmoothScroll>
            <Navbar />
            {/* Navbar-এর নিচে মেইন কন্টেন্ট থাকার জন্য একটু প্যাডিং দেওয়া হলো */}
            <div className="pt-20"> 
              {children}
            </div>
            <Footer />
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  );
}