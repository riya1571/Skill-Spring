import Link from "next/link";
import { GitBranch, Globe, Users, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Skill Spring
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm">
              An AI-Powered Project-Based Learning Platform. Learn programming by building real-world projects with instant AI mentorship.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-3">
              <li><Link href="/mentor" className="text-slate-400 hover:text-white transition-colors">AI Mentor</Link></li>
              <li><Link href="/projects" className="text-slate-400 hover:text-white transition-colors">Real Projects</Link></li>
              <li><Link href="/challenges" className="text-slate-400 hover:text-white transition-colors">Challenges</Link></li>
              <li><Link href="/portfolio" className="text-slate-400 hover:text-white transition-colors">Auto Portfolio</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <GitBranch size={20} /> 
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <Globe size={20} /> 
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <Users size={20} /> 
              </a>
            </div>
          </div>
          
        </div> {/* <-- এই ক্লোজিং ডিভটা মিসিং ছিল */}

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {currentYear} Skill Spring. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 justify-center">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}