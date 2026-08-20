"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight,
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  ChevronUp,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface AuditLog {
  id: number;
  created_at: string;
  user_email: string;
  ministry: string;
  query_preview: string;
  full_query: string;
  response_preview: string;
  is_flagged: boolean;
  sensitivity_keywords_found: string;
  response_time_ms: number;
  role?: string;
}

const MinistryPill = ({ ministry }: { ministry: string }) => {
  const ministryColors: Record<string, string> = {
    Finance: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Defense: "border-red-500/30 bg-red-500/10 text-red-500",
    Health: "border-green-500/30 bg-green-500/10 text-green-500",
    Law: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    Education: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    General: "border-[#222] bg-[#1a1a1a] text-[#a3a3a3]",
  };

  return (
    <Badge className={cn("px-2 py-0 h-5 text-[9px] font-black uppercase tracking-tighter", ministryColors[ministry] || ministryColors.General)}>
      {ministry}
    </Badge>
  );
};

export const AuditTable = ({ logs }: { logs: AuditLog[] }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset page when logs change (e.g., from search)
  React.useEffect(() => {
     setCurrentPage(1);
  }, [logs.length]);

  // Actually sort the logs before paginating
  const sortedLogs = React.useMemo(() => {
    if (!sortConfig) return logs;
    return [...logs].sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortConfig.direction === 'asc' ? diff : -diff;
      }
      if (sortConfig.key === 'risk') {
        // flagged entries sort first on desc
        const diff = (a.is_flagged ? 1 : 0) - (b.is_flagged ? 1 : 0);
        return sortConfig.direction === 'asc' ? diff : -diff;
      }
      if (sortConfig.key === 'latency') {
        const diff = a.response_time_ms - b.response_time_ms;
        return sortConfig.direction === 'asc' ? diff : -diff;
      }
      return 0;
    });
  }, [logs, sortConfig]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedLogs.length);
  const currentLogs = sortedLogs.slice(startIndex, endIndex);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <ArrowUpNarrowWide className="h-3 w-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ArrowUpNarrowWide className="h-3 w-3 text-[#f59e0b]" /> : <ArrowDownNarrowWide className="h-3 w-3 text-[#f59e0b]" />;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#222] bg-[#080808]">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-[#111] border-b border-[#222]">
            <tr>
              <th onClick={() => handleSort('created_at')} className="group cursor-pointer px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252] hover:text-[#f5f5f5]">
                <div className="flex items-center gap-2">Time <SortIcon column="created_at" /></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">User</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">Ministry</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">Query Cluster</th>
              <th onClick={() => handleSort('risk')} className="group cursor-pointer px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252] hover:text-[#f5f5f5]">
                <div className="flex items-center gap-2">Risk Status <SortIcon column="risk" /></div>
              </th>
              <th onClick={() => handleSort('latency')} className="group cursor-pointer px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252] hover:text-[#f5f5f5]">
                <div className="flex items-center gap-2">Latency <SortIcon column="latency" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161616]">
            {currentLogs.map((log) => (
              <React.Fragment key={log.id}>
                <tr 
                  onClick={() => toggleExpand(log.id)}
                  className={cn(
                    "group relative cursor-pointer border-l-[3px] border-transparent transition-all hover:bg-[#111] active:bg-[#141414]",
                    log.is_flagged ? "border-l-red-500 bg-red-500/[0.04]" : "",
                    expandedId === log.id ? (log.is_flagged ? "bg-red-500/[0.06]" : "bg-[#111] border-l-[#f59e0b]") : ""
                  )}
                >
                  {/* Time Column */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-[#f5f5f5]">
                        {new Date(log.created_at).toLocaleTimeString('en-US', { 
                          hour12: false, 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit' 
                        })}
                      </span>
                      <span className="text-[9px] font-bold text-[#525252] uppercase tracking-tighter mt-0.5">
                        {new Date(log.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>

                  {/* User Column */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#222] text-xs font-black shadow-inner",
                        log.is_flagged ? "bg-red-500/10 text-red-500" : "bg-[#161616] text-[#a3a3a3]"
                      )}>
                        {log.user_email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#f5f5f5] truncate">{log.user_email.split('@')[0]}</span>
                          <Badge variant="outline" className="h-3.5 px-1.5 text-[7px] font-black uppercase text-[#525252] border-[#222]">
                            {log.role || 'Officer'}
                          </Badge>
                        </div>
                        <span className="text-[9px] text-[#525252] truncate lowercase">{log.user_email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Ministry Column */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <MinistryPill ministry={log.ministry} />
                  </td>

                  {/* Query Column */}
                  <td className="px-6 py-5">
                    <div className="max-w-[280px] truncate text-xs font-medium text-[#a3a3a3] transition-colors group-hover:text-[#f5f5f5]">
                      {log.query_preview}
                    </div>
                  </td>

                  {/* Risk Status Column */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    {log.is_flagged ? (
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="flex items-center gap-2"
                          initial={{ x: 0 }}
                          animate={{ x: [0, -2, 2, -2, 2, 0] }}
                          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <div className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-red-500">Flagged</span>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500/50">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Secure</span>
                      </div>
                    )}
                  </td>

                  {/* Latency Column */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5 w-24">
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-mono font-black",
                        log.response_time_ms < 1000 ? "text-green-500" : 
                        log.response_time_ms < 2000 ? "text-amber-500" : "text-red-500"
                      )}>
                        <Clock className="h-3 w-3 opacity-50" />
                        {log.response_time_ms}ms
                      </div>
                      <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden border border-[#222]/50">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 ease-out",
                            log.response_time_ms < 1000 ? "bg-green-500/40" : 
                            log.response_time_ms < 2000 ? "bg-amber-500/40" : "bg-red-500/40"
                          )}
                          style={{ width: `${Math.min((log.response_time_ms / 3000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                
                <AnimatePresence>
                  {expandedId === log.id && (
                    <tr>
                      <td colSpan={5} className="bg-[#050505] p-0 border-y border-[#161616]">  
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
                            {/* Left Side: Query Details */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#525252] mb-3">
                                  <ChevronRight className="h-3 w-3 text-[#f59e0b]" />
                                  Full Interaction Trace
                                </h4>
                                <div className="rounded-xl border border-[#222] bg-[#080808] p-5 text-sm leading-relaxed text-[#f5f5f5] font-mono shadow-inner group/code relative">
                                  {log.full_query}
                                  <button className="absolute right-3 top-3 opacity-0 group-hover/code:opacity-100 transition-opacity text-[#525252] hover:text-[#f59e0b]">
                                    <ExternalLink className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {log.is_flagged && (
                                <motion.div 
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  className="rounded-xl bg-red-500/5 border border-red-500/20 p-5"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <ShieldAlert className="h-4 w-4 text-red-500" />
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Firewall Interception Analysis</p>
                                  </div>
                                  <p className="text-xs text-red-200/60 leading-relaxed mb-4">
                                    The following classified or sensitive tokens were detected in the query stream:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {log.sensitivity_keywords_found.split(',').map(kw => (
                                      <span key={kw} className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-mono px-2 py-1 rounded lowercase">
                                        {kw.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Right Side: Response & Actions */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#525252] mb-3">
                                  <ChevronRight className="h-3 w-3 text-[#f59e0b]" />
                                  BharatAI Sovereign Response
                                </h4>
                                <div className="rounded-xl border border-[#222] bg-[#0c0c0c]/50 p-5 text-sm leading-relaxed text-[#a3a3a3] font-mono italic opacity-90 shadow-inner">
                                  {log.response_preview}
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 pt-4">
                                <div className="flex gap-3">
                                  <button onClick={() => toast.success(`Investigation TR-${log.id * 1024}-${new Date().getFullYear()} marked as reviewed.`)} className="flex-1 rounded-xl bg-green-500/10 border border-green-500/30 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-green-500 hover:bg-green-500/20 transition-all flex items-center justify-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Mark as Reviewed
                                  </button>
                                  <button onClick={() => toast.error(`Incident escalated to Tier-2 Security.`, { icon: '🚨' })} className="flex items-center justify-center rounded-xl bg-[#161616] border border-[#222] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#a3a3a3] hover:text-[#f5f5f5] hover:border-[#333] transition-all">
                                    Escalate Incident
                                  </button>
                                </div>
                                <div className="text-center">
                                  <span className="text-[9px] font-bold text-[#333] uppercase tracking-[0.3em]">
                                    Investigation ID: TR-{log.id * 1024}-{new Date().getFullYear()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[#111] px-8 py-5 border-t border-[#222] gap-4">
        <div className="flex items-center gap-4">
          <div className="text-[10px] text-[#525252] uppercase font-bold tracking-[0.2em]">
            Protocol Batch <span className="text-[#f5f5f5] ml-1">{currentPage.toString().padStart(2, '0')} / {totalPages.toString().padStart(2, '0')}</span>
          </div>
          <div className="h-4 w-[1px] bg-[#222]" />
          <div className="text-[10px] text-[#525252] uppercase font-bold tracking-[0.2em]">
            Records <span className="text-[#f5f5f5] ml-1">{sortedLogs.length === 0 ? 0 : startIndex + 1} — {endIndex}</span> of <span className="text-[#f5f5f5] ml-1">{sortedLogs.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
             disabled={currentPage === 1}
             className="flex items-center gap-2 rounded-lg border border-[#222] bg-[#080808] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#333] hover:text-[#f5f5f5] hover:border-[#333] disabled:cursor-not-allowed disabled:hover:text-[#333] disabled:hover:border-[#222] disabled:opacity-50 transition-all">
            Prev
          </button>
          
          <button 
             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
             disabled={currentPage === totalPages}
             className="flex items-center gap-2 rounded-lg border border-[#222] bg-[#080808] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#f5f5f5] hover:border-[#333] hover:bg-[#111] active:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-50 transition-all">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
