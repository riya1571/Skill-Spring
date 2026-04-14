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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-[#0d1117] border border-emerald-500/50 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center max-w-sm w-full"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verified Hero!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your bank details have been securely saved. You are now ready to accept paid bounties.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Form Content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-12 relative overflow-hidden">
        {/* Subtle Background Glow if verified */}
        {isVerified && (
          <div className="absolute top-0 right-0 w-full h-full bg-emerald-500/5 pointer-events-none rounded-3xl" />
        )}

        <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2 relative z-10">
           <Building className={isVerified ? "text-emerald-500" : "text-blue-500"} /> 
           Payout Settings & Verification
        </h3>
        <p className="text-sm text-slate-400 mb-8 relative z-10">
          {isVerified 
            ? "Your bank details are securely saved. You are verified and ready to receive payouts." 
            : "Add your bank details to verify your profile and start accepting paid bounties."}
        </p>

        <form onSubmit={handleVerify} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Name</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.accountName} onChange={(e) => setBankInfo({...bankInfo, accountName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-white focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Number</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.accountNumber} onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-white focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Name</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-white focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Routing Number</label>
              <input type="text" required disabled={isVerified}
                value={bankInfo.routingNumber} onChange={(e) => setBankInfo({...bankInfo, routingNumber: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-white focus:border-blue-500 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {!isVerified && (
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3">
              {saving ? <Loader2 className="animate-spin" /> : <CreditCard size={18} />} Verify & Save Details
            </button>
          )}
        </form>
      </div>
    </div>
  );
}