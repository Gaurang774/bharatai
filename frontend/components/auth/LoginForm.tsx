"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const DEMO_ACCOUNTS = [
  {
    label: "NIC Admin",
    ministry: "National Informatics Centre",
    email: "admin@nic.gov.in",
    password: "admin123",
    color: "#f59e0b",
    badge: "Admin",
    featured: true,
  },
  {
    label: "Finance Officer",
    ministry: "Ministry of Finance",
    email: "officer@finance.gov.in",
    password: "finance123",
    color: "#3b82f6",
    badge: "Officer",
    featured: false,
  },
  {
    label: "Defense Analyst",
    ministry: "Ministry of Defense",
    email: "analyst@defense.gov.in",
    password: "defense123",
    color: "#ef4444",
    badge: "Analyst",
    featured: false,
  },
];

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
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

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(account.email);
    setEmail(account.email);
    setPassword(account.password);
    try {
      const response = await authApi.login({ email: account.email, password: account.password });
      setToken(response.data.access_token);
      toast.success(`Welcome, ${account.label} — ${account.ministry}`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Demo login failed.");
    } finally {
      setDemoLoading(null);
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

        {/* Demo Quick-Login Section */}
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[#222]" />
            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#333]">
              <Zap className="h-2.5 w-2.5" />
              Demo Access
            </span>
            <div className="h-[1px] flex-1 bg-[#222]" />
          </div>

          <div className="flex flex-col gap-2">
            {/* Featured NIC Admin Button */}
            {DEMO_ACCOUNTS.filter(a => a.featured).map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleDemoLogin(account)}
                disabled={!!demoLoading}
                className="group relative flex items-center gap-3 overflow-hidden rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5 px-4 py-3 text-left transition-all hover:border-[#f59e0b]/60 hover:bg-[#f59e0b]/10 disabled:opacity-50"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ backgroundColor: account.color }}
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f59e0b]/10">
                  <ShieldCheck className="h-4 w-4 text-[#f59e0b]" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#f5f5f5]">
                      {account.label}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider"
                      style={{ color: account.color, backgroundColor: `${account.color}15` }}
                    >
                      {account.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#666]">{account.ministry} — Governance & Audit</span>
                </div>
                {demoLoading === account.email ? (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#f59e0b] animate-pulse">
                    Verifying…
                  </span>
                ) : (
                  <Zap className="h-3.5 w-3.5 text-[#f59e0b]/50 transition-colors group-hover:text-[#f59e0b]" />
                )}
              </button>
            ))}

            {/* Other Demo Accounts */}
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.filter(a => !a.featured).map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  disabled={!!demoLoading}
                  className="group relative flex flex-col items-start gap-1 overflow-hidden rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2.5 text-left transition-all hover:border-[#2a2a2a] hover:bg-[#111] disabled:opacity-50"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px]"
                    style={{ backgroundColor: account.color }}
                  />
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#f5f5f5]">
                      {account.label}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider"
                      style={{ color: account.color, backgroundColor: `${account.color}15` }}
                    >
                      {account.badge}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#444]">{account.ministry}</span>
                  {demoLoading === account.email && (
                    <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: account.color }}>
                      Authenticating…
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <p className="flex items-center gap-2 text-[10px] font-medium text-[#525252]">
            <ShieldCheck className="h-3 w-3" />
            Protected by NIC Security Framework
          </p>
        </div>
      </div>
    </motion.div>
  );
};
