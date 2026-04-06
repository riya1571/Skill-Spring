"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserCircle, LogOut, LayoutDashboard } from "lucide-react";
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
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 180 }} 
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
          />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Skill Spring
          </span>
        </Link>

        {/* Middle: Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-800 rounded-full -z-10 border border-slate-700"
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
            <button
              onClick={() => signIn("google")}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
            >
              Log in / Sign up
            </button>
          )}
        </div>

      </div>
    </motion.nav>
  );
}