"use client";

import React, { useState, useEffect } from "react";
import { Shield, Bell, Zap, Info } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Tooltip } from "@/components/ui/Tooltip";
import { getUser } from "@/lib/auth";

export const TopBar = () => {
  const [ministry, setMinistry] = useState("General");

  useEffect(() => {
    const fromStorage = localStorage.getItem("bharatai_ministry");
    const fromToken = getUser()?.ministry;
    setMinistry(fromStorage || fromToken || "General");

    // Poll for same-tab changes from the Sidebar dropdown
    const interval = setInterval(() => {
      const val = localStorage.getItem("bharatai_ministry");
      if (val) setMinistry(val);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-[260px] right-0 z-30 flex h-[52px] items-center justify-between border-b border-[#222] bg-[#080808]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 className="text-xs font-semibold text-[#f5f5f5]">
          New Analysis Session
        </h2>
        <div className="h-4 w-[1px] bg-[#222]" />
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-[#f59e0b]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]/80">
            {ministry} Knowledge Base Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4">
          <Tooltip content="Infrastructure latency">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#525252]">
              <Zap className="h-3 w-3" />
              ~1.2s avg
            </div>
          </Tooltip>
          <StatusBadge status="secure" />
        </div>

        <div className="h-4 w-[1px] bg-[#222]" />

        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-1.5 text-[#525252] hover:bg-[#161616] hover:text-[#f5f5f5]">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
          </button>
          <button className="rounded-lg p-1.5 text-[#525252] hover:bg-[#161616] hover:text-[#f5f5f5]">
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
