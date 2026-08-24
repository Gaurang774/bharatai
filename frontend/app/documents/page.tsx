"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { FolderLock, RotateCcw, FileText, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getUser, type UserPayload } from "@/lib/auth";
import { documentApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function DocumentVaultPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    fetchDocuments();
  }, [router]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await documentApi.list();
      setDocuments(res.data);
    } catch (err) {
      toast.error("Failed to fetch documents from vault.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

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
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f59e0b]">Knowledge Repository</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-[#f5f5f5]">
                Document <span className="text-[#333] font-thin">/</span> <span className="text-[#a3a3a3]">Vault</span>
              </h1>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#525252]">
                Secure Sovereign Index & Context Store
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                 onClick={fetchDocuments}
                 disabled={isLoading}
                 className="flex items-center gap-3 rounded-xl border border-[#222] bg-[#111] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#a3a3a3] hover:text-[#f5f5f5] hover:border-[#333] transition-all shadow-sm active:scale-95"
               >
                 <RotateCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-[#f59e0b]")} />
                 {isLoading ? "Syncing..." : "Refresh Vault"}
               </button>
            </div>
          </header>

          <div className="space-y-10 relative z-10">
            {/* Documents Table */}
            <div className="overflow-hidden rounded-2xl border border-[#222] bg-[#0c0c0c] shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#222] bg-[#111]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">Filename</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">Ministry / Domain</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">Size</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252]">Uploaded</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#525252] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <tr key={doc.id} className="group hover:bg-[#111] transition-colors">
                        <td className="px-6 py-4 text-xs font-mono font-medium text-[#525252]">#{doc.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-[#a3a3a3] group-hover:text-[#f59e0b] transition-colors" />
                            <span className="font-bold text-[#f5f5f5] truncate max-w-[300px]" title={doc.filename}>{doc.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full border border-[#222] bg-[#1a1a1a] px-2.5 py-0.5 text-[10px] font-bold text-[#a3a3a3]">
                            {doc.ministry}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-[#a3a3a3]">{doc.chunk_count} chunks</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-medium text-[#525252]">
                          {formatDate(doc.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#f59e0b] hover:bg-[#f59e0b]/20 transition-colors"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Chat
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FolderLock className="h-8 w-8 text-[#222] mb-4" />
                          <p className="text-[11px] font-black uppercase tracking-widest text-[#525252]">Vault is empty</p>
                          <p className="mt-1 text-[10px] font-medium text-[#333]">Upload documents in the Sovereign Chat to securely index them.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dense Grid Decoration */}
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="pointer-events-none absolute top-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-[#f59e0b]/[0.02] blur-[120px]" />
      </main>
    </div>
  );
}
