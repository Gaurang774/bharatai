"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      setToken(response.data.access_token);
      
      toast.success("Identity Verified. Welcome back, Officer.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Authentication Failed. Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="relative overflow-hidden rounded-xl border border-[#222] bg-[#111] p-8 shadow-2xl">
        {/* Superior Amber Edge */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#f59e0b]" />
        
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f59e0b]/10 text-[#f59e0b]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#f5f5f5]">
            Secure Access Portal
          </h2>
          <p className="mt-2 text-sm text-[#a3a3a3]">
            Government of India — Classified Network
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
            Sovereign Mode Active
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
              Identity (Email)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525252]" />
              <input
                type="email"
                placeholder="officer@nic.gov.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#222] bg-[#080808] py-3 pl-10 pr-4 text-sm text-[#f5f5f5] transition-all focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
              Access Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525252]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#222] bg-[#080808] py-3 pl-10 pr-12 text-sm text-[#f5f5f5] transition-all focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#a3a3a3]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-base font-bold uppercase tracking-widest"
            isLoading={isLoading}
          >
            Authenticate
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="h-[1px] w-full bg-[#222]" />
          <p className="flex items-center gap-2 text-[10px] font-medium text-[#525252]">
            <ShieldCheck className="h-3 w-3" />
            Protected by NIC Security Framework
          </p>
        </div>
      </div>
    </motion.div>
  );
};
