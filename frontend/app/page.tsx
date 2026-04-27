"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Side - 40% (Information & Brand) */}
      <div className="relative flex flex-col justify-between bg-[#080808] p-12 lg:w-[40%]">
        {/* Subtle Grid Pattern */}
        <div className="grid-pattern absolute inset-0 opacity-20 pointer-events-none" />
        
        {/* Sovereign Line Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#f59e0b]/50 to-transparent" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-2"
          >
            <span className="text-4xl mb-4">🇮🇳</span>
            <h1 className="text-5xl font-black tracking-tighter text-[#f5f5f5]">
              Bharat<span className="text-[#f59e0b]">AI</span>
            </h1>
            <p className="text-lg font-medium text-[#a3a3a3] uppercase tracking-widest">
              Sovereign Intelligence Terminal
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-6">
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed text-[#525252]">
                Secure large language models hosted on sovereign Indian infrastructure. 
                Purpose-built for the Ministry of Finance, Defense, and Public Administration.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#525252] uppercase tracking-tighter">Powered by</span>
                <span className="text-xs font-bold text-[#f5f5f5] tracking-widest uppercase">NIC</span>
              </div>
              <div className="h-8 w-[1px] bg-[#222]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#525252] uppercase tracking-tighter">Network Status</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 tracking-widest uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Secure
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - 60% (Login Area) */}
      <div className="flex flex-1 items-center justify-center bg-[#111] p-12 lg:w-[60%]">
        <LoginForm />
      </div>

      {/* Floating Footer Disclaimer */}
      <div className="fixed bottom-4 left-0 right-0 pointer-events-none flex justify-center opacity-30 lg:justify-end lg:pr-12">
        <p className="text-[10px] text-[#525252] uppercase tracking-[0.2em]">
          Classified Information Handling Authorized Personnel Only
        </p>
      </div>
    </main>
  );
}
