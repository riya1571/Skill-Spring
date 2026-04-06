"use client";

import { motion } from "framer-motion";
import { Code2, Bot, Briefcase, Zap, ChevronRight, Globe } from "lucide-react";
import Link from "next/link";

// অ্যানিমেশন ভেরিয়েন্ট
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function Home() {
  const features = [
    {
      icon: <Bot size={32} className="text-blue-400" />,
      title: "AI Mentor",
      desc: "কোডে ভুল হলে সাথে সাথে ব্যাখ্যা এবং ফিক্স করার উপায় জেনে নাও।",
    },
    {
      icon: <Code2 size={32} className="text-purple-400" />,
      title: "Real Project Learning",
      desc: "ছোট এক্সারসাইজ নয়, একদম ইন্ডাস্ট্রি স্ট্যান্ডার্ড রিয়েল প্রজেক্ট তৈরি করো।",
    },
    {
      icon: <Briefcase size={32} className="text-emerald-400" />,
      title: "Auto Portfolio",
      desc: "কাজ করার সাথে সাথে স্বয়ংক্রিয়ভাবে তোমার প্রফেশনাল পোর্টফোলিও তৈরি হবে।",
    },
    {
      icon: <Zap size={32} className="text-yellow-400" />,
      title: "Hands-on Challenges",
      desc: "লাইভ কোডিং চ্যালেঞ্জ দিয়ে নিজের স্কিল যাচাই করো রিয়েল-টাইমে।",
    },
    {
      icon: <Globe size={32} className="text-pink-400" />,
      title: "Real-World Tasks",
      desc: "NGO বা ছোট কোম্পানির বাস্তব সমস্যার সমাধান করে অভিজ্ঞতা অর্জন করো।",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          <motion.div variants={fadeIn} className="inline-block mb-4 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-sm text-blue-400 font-medium">
            🚀 The Future of Programming Education
          </motion.div>
          
          <motion.div variants={fadeIn}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
              Build Real Projects with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                AI Mentorship
              </span>
            </h1>
          </motion.div>

          <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            শুধু থিওরি না, এবার শেখো কাজ করে। রিয়েল-ওয়ার্ল্ড প্রজেক্ট বানাও, সাথে সাথে AI-এর সাহায্য নাও এবং নিজের প্রফেশনাল পোর্টফোলিও তৈরি করো।
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:bg-blue-500"
            >
              <span>Get Started</span>
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-300 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-800 transition-all"
            >
              Explore Features
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            ইন্ডাস্ট্রি রেডি হওয়ার জন্য প্রয়োজনীয় সব টুলস এখন এক জায়গায়।
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors backdrop-blur-sm group"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}