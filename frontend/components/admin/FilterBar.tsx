"use client";

import React from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  onSearch: (q: string) => void;
  onFilterChange: (filters: any) => void;
  resultCount: number;
  totalCount?: number;
}

export const FilterBar = ({ onSearch, onFilterChange, resultCount, totalCount = 284 }: FilterBarProps) => {
  // State for active filters (simplified for visual indicator)
  const [activeFilters] = React.useState({
    ministry: false,
    risk: false,
    date: false
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#222] bg-[#111] p-4 shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {/* Result Counter (Repositioned as requested) */}
        <div className="px-3 py-1.5 rounded-lg bg-[#080808] border border-[#222] flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#525252]">Showing</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f5f5f5]">{resultCount} of {totalCount}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#525252]">Interactions</span>
        </div>

        <div className="h-6 w-[1px] bg-[#222]" />

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#525252]" />
          <input
            type="text"
            placeholder="Search queries, users, or keywords..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg border border-[#222] bg-[#080808] py-2.5 pl-9 pr-12 text-xs text-[#f5f5f5] outline-none transition-all focus:border-[#f59e0b]/50 placeholder:text-[#333]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#222] bg-[#111] px-1.5 py-0.5 text-[8px] font-black text-[#333] shadow-sm">
            ⌘K
          </div>
        </div>

        <div className="h-6 w-[1px] bg-[#222]" />

        <div className="flex items-center gap-2">
            {/* Ministry Dropdown */}
            <button className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                activeFilters.ministry 
                    ? "border-[#f59e0b]/50 bg-[#f59e0b]/5 text-[#f59e0b]" 
                    : "border-[#222] bg-[#080808] text-[#525252] hover:text-[#a3a3a3] hover:border-[#333]"
            )}>
                <Filter className="h-3.2 w-3.2" />
                Ministry
                <ChevronDown className="h-3.2 w-3.2 opacity-50" />
            </button>

            {/* Risk Dropdown */}
            <button className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                activeFilters.risk 
                    ? "border-[#f59e0b]/50 bg-[#f59e0b]/5 text-[#f59e0b]" 
                    : "border-[#222] bg-[#080808] text-[#525252] hover:text-[#a3a3a3] hover:border-[#333]"
            )}>
                Threat Level
                <ChevronDown className="h-3.2 w-3.2 opacity-50" />
            </button>

            {/* Date Dropdown */}
            <button className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                activeFilters.date 
                    ? "border-[#f59e0b]/50 bg-[#f59e0b]/5 text-[#f59e0b]" 
                    : "border-[#222] bg-[#080808] text-[#525252] hover:text-[#a3a3a3] hover:border-[#333]"
            )}>
                Timeline
                <ChevronDown className="h-3.2 w-3.2 opacity-50" />
            </button>
        </div>
      </div>

      <button onClick={() => onSearch("")} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#333] hover:text-[#f59e0b] transition-colors group">
        <X className="h-3 w-3 group-hover:rotate-90 transition-transform" />
        Reset Filter Protocol
      </button>
    </div>
  );
};
