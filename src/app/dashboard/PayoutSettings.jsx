"use client";
import React, { useState } from "react";
import { CreditCard, Building, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PayoutSettings({ email, initialVerified, initialBankDetails }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // সাকসেস মেসেজের জন্য স্টেট

  const [bankInfo, setBankInfo] = useState({
    accountName: initialBankDetails?.accountName || "",
    accountNumber: initialBankDetails?.accountNumber || "",
    bankName: initialBankDetails?.bankName || "",
    routingNumber: initialBankDetails?.routingNumber || ""
  });

  const handleVerify = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, bankDetails: bankInfo })
      });

      if (res.ok) {
        setIsVerified(true);
        setShowSuccess(true); // সাকসেস অ্যানিমেশন ট্রিগার
        router.refresh(); // সার্ভার ডাটা রিফ্রেশ

        // সাড়ে ৩ সেকেন্ড পর সাকসেস মেসেজটি হাইড করে দেবে
        setTimeout(() => {
          setShowSuccess(false);
        }, 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Animated Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900/90 border border-emerald-500/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center max-w-sm w-full backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Verified Hero!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your bank details have been securely saved. You are now ready to accept paid bounties.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Form Content */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-12 relative overflow-hidden shadow-inner group">
        {/* Subtle Background Glow if verified */}
        {isVerified && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-transparent pointer-events-none transition-all duration-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2 relative z-10 tracking-tight">
          <Building className={isVerified ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]"} size={24} />
          Payout Settings
        </h3>
        <p className="text-sm text-slate-400 mb-8 relative z-10 max-w-2xl leading-relaxed">
          {isVerified
            ? "Your bank details are securely saved. You are verified and ready to receive payouts."
            : "Add your bank details to verify your profile and start accepting paid bounties."}
        </p>

        <form onSubmit={handleVerify} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.accountName} onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.accountNumber} onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.bankName} onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Routing Number</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.routingNumber} onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
                className="w-full bg-slate-950/60 border border-slate-700/50 p-3.5 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600"
              />
            </div>
          </div>

          {!isVerified && (
            <button type="submit" disabled={saving} className="relative bg-slate-800 border border-slate-700 hover:border-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 overflow-hidden group/submit shadow-lg w-full md:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover/submit:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                {saving ? <Loader2 className="animate-spin" /> : <CreditCard size={18} className="group-hover/submit:-rotate-12 transition-transform" />} Verify & Save Details
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}