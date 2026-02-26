"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsCards } from "@/components/admin/StatsCards";
import { FilterBar } from "@/components/admin/FilterBar";
import { AuditTable } from "@/components/admin/AuditTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { Shield, Lock, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getUser, type UserPayload } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(0);

  const filteredLogs = logs.filter(log => {
      const q = searchQuery.toLowerCase();
      return (log.query_preview && log.query_preview.toLowerCase().includes(q)) || 
             (log.user_email && log.user_email.toLowerCase().includes(q)) ||
             (log.ministry && log.ministry.toLowerCase().includes(q));
  });

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }

    if (u.role !== "admin") {
      setIsLoading(false);
      return;
    }

    setUser(u);
    fetchAdminData();

    // Timer for "last refreshed"
    const timer = setInterval(() => {
      setLastRefreshed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getLogs({ page: 1 })
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setLastRefreshed(0);
    } catch (err) {
      toast.error("Access Restriction: Failed to fetch administrative audit data.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastRefreshed = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  if (!isLoading && user?.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080808] p-6 text-center">
        {/* Simple Unauthorized View as before */}
        <div className="flex flex-col items-center">
            <Lock className="h-12 w-12 text-red-500 mb-6" />
            <h1 className="text-2xl font-black text-[#f5f5f5]">Access Prohibited</h1>
            <Button className="mt-8" onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#080808]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pl-[260px] pb-20 no-scrollbar relative">
        <div className="mx-auto max-w-7xl px-10 py-10">
          {/* Header Section */}
          <header className="mb-12 flex items-end justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f59e0b] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f59e0b]"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f59e0b]">Sovereign Oversight Platform</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-[#f5f5f5]">
                Governance <span className="text-[#333] font-thin">/</span> <span className="text-[#a3a3a3]">Terminal</span>
              </h1>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#525252]">
                Institutional Compliance & Threat Monitoring Matrix
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end gap-1 px-4 border-r border-[#222]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#333]">Synchronization</span>
                  <span className="text-[10px] font-mono font-bold text-[#525252]">{formatLastRefreshed(lastRefreshed)}</span>
               </div>
               <button 
                 onClick={fetchAdminData}
                 disabled={isLoading}
                 className="flex items-center gap-3 rounded-xl border border-[#222] bg-[#111] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#a3a3a3] hover:text-[#f5f5f5] hover:border-[#333] transition-all shadow-sm active:scale-95"
               >
                 <RotateCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-[#f59e0b]")} />
                 {isLoading ? "Running Sync..." : "Refresh Matrix"}
               </button>
               <ExportButton />
            </div>
          </header>

          <div className="space-y-10">
            <StatsCards stats={stats} />
            
            <div className="space-y-5">
              <FilterBar 
                resultCount={filteredLogs.length}
                totalCount={logs.length}
                onSearch={setSearchQuery} 
                onFilterChange={() => {}} 
              />
              <AuditTable logs={filteredLogs} />
            </div>
          </div>
        </div>

        {/* Dense Grid Decoration */}
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      </main>
    </div>
  );
}
