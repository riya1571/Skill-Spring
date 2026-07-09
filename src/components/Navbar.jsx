"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserCircle, LogOut, LayoutDashboard, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[auto] -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-30"
            />
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="relative z-10 flex items-center justify-center w-[calc(100%-2px)] h-[calc(100%-2px)] bg-slate-950 rounded-xl backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 drop-shadow-sm group-hover:from-white group-hover:to-white transition-all duration-300">
              Skill Spring
            </span>
            <span className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-widest -mt-1 group-hover:text-purple-300 transition-colors">
              Elevate Your Craft
            </span>
          </div>
        </Link>

        {/* Middle: Navigation Links (Desktop) */}
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

        {/* Right: Auth / Profile / Mobile Menu Toggle */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {status === "loading" ? (
            <div className="w-20 h-9 bg-slate-800 animate-pulse rounded-full"></div>
          ) : session ? (
            // Logged In State: Profile Dropdown
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 md:pl-2 pr-3 md:pr-4 py-1 md:py-1.5 bg-slate-900 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-7 h-7 md:w-8 md:h-8 rounded-full" />
                ) : (
                  <UserCircle className="w-7 h-7 md:w-8 md:h-8 text-slate-400" />
                )}
                <span className="text-xs md:text-sm font-medium hidden sm:block">{session.user?.name?.split(" ")[0]}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                >
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={() => setIsDropdownOpen(false)}>
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
              className="px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all inline-block"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center ${
                      isActive 
                        ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}