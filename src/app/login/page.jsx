"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
// নিশ্চিত করো এখানে getSession যোগ করা আছে
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoading("credentials");
    setError("");

    const res = await signIn("credentials", {
      email, password, redirect: false
    });

    if (res.error) {
      setError(res.error);
      setLoading(null);
    } else {
      const session = await getSession(); // বর্তমান সেশন ডাটা নেওয়া হচ্ছে
      
      if (session?.user?.role === "admin") {
        router.push("/admin"); // অ্যাডমিন হলে অ্যাডমিন প্যানেলে
      } else {
        router.push("/"); // সাধারণ ইউজার হলে পোর্টফোলিওতে
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition text-sm font-bold uppercase tracking-widest z-50">
        <ArrowLeft size={16} /> Home
      </Link>

      <div className="w-full max-w-md bg-[#0d1117]/60 backdrop-blur-2xl border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Rocket className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-2">Welcome Back</h1>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl mb-4 text-center">{error}</div>}

        <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
          <input 
            type="email" placeholder="Email Address" required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-2xl text-sm text-white focus:border-blue-500 outline-none"
          />
          <input 
            type="password" placeholder="Password" required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#05070a] border border-gray-800 p-4 rounded-2xl text-sm text-white focus:border-blue-500 outline-none"
          />
          <button 
            type="submit" disabled={loading !== null}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all flex justify-center items-center"
          >
            {loading === "credentials" ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <div className="relative flex items-center py-2 mb-6">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase tracking-widest font-bold">Or continue with</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <button 
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        <p className="text-center text-xs text-gray-500 mt-8 font-medium">
          New here? <Link href="/register" className="text-blue-500 hover:text-blue-400 font-bold underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}