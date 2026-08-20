"use client";

import React from "react";
import { Search, Filter, ChevronDown, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const MINISTRIES = ["Finance", "Defense", "Health", "Law", "Education", "General"];

interface FilterState {
  ministry: string | null;
  flaggedOnly: boolean;
}

interface FilterBarProps {
  onSearch: (q: string) => void;
  onFilterChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount?: number;
}

export const FilterBar = ({ onSearch, onFilterChange, resultCount, totalCount = 284 }: FilterBarProps) => {
  const [ministry, setMinistry] = React.useState<string | null>(null);
  const [flaggedOnly, setFlaggedOnly] = React.useState(false);
  const [ministryOpen, setMinistryOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const applyFilters = (newMinistry: string | null, newFlagged: boolean) => {
    onFilterChange({ ministry: newMinistry, flaggedOnly: newFlagged });
  };

  const handleMinistrySelect = (m: string | null) => {
    setMinistry(m);
    setMinistryOpen(false);
    applyFilters(m, flaggedOnly);
  };

  const handleFlaggedToggle = () => {
    const next = !flaggedOnly;
    setFlaggedOnly(next);
    applyFilters(ministry, next);
  };

  const handleReset = () => {
    setMinistry(null);
    setFlaggedOnly(false);
    setSearchValue("");
    onSearch("");
    onFilterChange({ ministry: null, flaggedOnly: false });
  };

  const hasActiveFilters = ministry || flaggedOnly || searchValue;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#222] bg-[#111] p-4 shadow-sm">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {/* Result Counter */}
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
            value={searchValue}
            placeholder="Search queries, users, or keywords..."
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full rounded-lg border border-[#222] bg-[#080808] py-2.5 pl-9 pr-12 text-xs text-[#f5f5f5] outline-none transition-all focus:border-[#f59e0b]/50 placeholder:text-[#333]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#222] bg-[#111] px-1.5 py-0.5 text-[8px] font-black text-[#333] shadow-sm">
            ⌘K
          </div>
        </div>

        <div className="h-6 w-[1px] bg-[#222]" />

        <div className="flex items-center gap-2">
          {/* Ministry Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMinistryOpen(!ministryOpen)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                ministry
                  ? "border-[#f59e0b]/50 bg-[#f59e0b]/5 text-[#f59e0b]"
                  : "border-[#222] bg-[#080808] text-[#525252] hover:text-[#a3a3a3] hover:border-[#333]"
              )}
            >
              <Filter className="h-3 w-3" />
              {ministry ?? "Ministry"}
              <ChevronDown className={cn("h-3 w-3 opacity-50 transition-transform", ministryOpen && "rotate-180")} />
            </button>
            {ministryOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-40 origin-top overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-2xl">
                <button
                  onClick={() => handleMinistrySelect(null)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-xs font-medium hover:bg-[#1c1c1c] transition-colors",
                    !ministry ? "text-[#f59e0b]" : "text-[#525252]"
                  )}
                >
                  All Ministries
                </button>
                {MINISTRIES.map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMinistrySelect(m)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-xs font-medium hover:bg-[#1c1c1c] transition-colors",
                      ministry === m ? "text-[#f59e0b]" : "text-[#525252]"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Flagged Only Toggle */}
          <button
            onClick={handleFlaggedToggle}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all",
              flaggedOnly
                ? "border-red-500/50 bg-red-500/5 text-red-500"
                : "border-[#222] bg-[#080808] text-[#525252] hover:text-[#a3a3a3] hover:border-[#333]"
            )}
          >
            <ShieldAlert className="h-3 w-3" />
            Threats Only
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors group",
          hasActiveFilters ? "text-[#f59e0b] hover:text-[#f5f5f5]" : "text-[#333] hover:text-[#f59e0b]"
        )}
      >
        <X className="h-3 w-3 group-hover:rotate-90 transition-transform" />
        Reset Filter Protocol
      </button>
    </div>
  );
};
