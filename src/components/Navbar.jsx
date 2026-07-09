"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserCircle, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // তোমার ৬টা মেইন ফিচারের লিংক
  const navLinks = [
    { name: "AI Mentor", path: "/mentor" },
    { name: "Projects", path: "/projects" },
    { name: "Challenges", path: "/challenges" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Real Tasks", path: "/tasks" },
    { name: "Community", path: "/community" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[auto] -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-30"
            />
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="relative z-10 flex items-center justify-center w-[calc(100%-2px)] h-[calc(100%-2px)] bg-slate-950 rounded-xl backdrop-blur-sm"
            >
              <Sparkles className="w-5 h-5 text-purple-300" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 drop-shadow-sm group-hover:from-white group-hover:to-white transition-all duration-300">
              Skill Spring
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest -mt-1 group-hover:text-purple-300 transition-colors">
              Elevate Your Craft
            </span>
          </div>
        </Link>

        {/* Middle: Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-800/80 rounded-full -z-10 border border-purple-500/30 shadow-[inset_0_0_12px_rgba(168,85,247,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth / Profile Button */}
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-24 h-10 bg-slate-800 animate-pulse rounded-full"></div>
          ) : session ? (
            // Logged In State: Profile Dropdown
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <UserCircle className="w-8 h-8 text-slate-400" />
                )}
                <span className="text-sm font-medium hidden sm:block">{session.user?.name?.split(" ")[0]}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                >
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors border-t border-slate-800"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            // Logged Out State: Login Button
            <Link
  href="/login"
  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all inline-block"
>
  Log in / Sign up
</Link>
          )}
        </div>

      </div>
    </motion.nav>
  );
}