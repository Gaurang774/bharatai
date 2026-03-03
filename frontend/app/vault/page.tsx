"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { documentApi } from "@/lib/api";
import {
  FolderLock,
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  Database,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MINISTRIES = ["General", "Finance", "Defense", "Health", "Law", "Education", "Infrastructure"];

interface DocRecord {
  id: number;
  filename: string;
  ministry: string;
  uploaded_by: string;
  chunk_count: number;
  created_at?: string;
}

export default function VaultPage() {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [selectedMinistry, setSelectedMinistry] = useState("General");
  const [docType, setDocType] = useState("general");
  const [user, setUser] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await documentApi.list();
      const allDocs: DocRecord[] = res.data;
      const currentUser = getUser();
      if (currentUser && currentUser.role !== "admin") {
        // Non-admins only see their own ministry + General docs
        setDocs(allDocs.filter(d => d.ministry === currentUser.ministry || d.ministry === "General"));
      } else {
        setDocs(allDocs);
      }
    } catch {
      toast.error("Failed to fetch documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    setUser(getUser());
    fetchDocs(); 
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ministry", selectedMinistry);
    formData.append("doc_type", docType);

    setIsUploading(true);
    setUploadResult(null);
    try {
      const res = await documentApi.upload(formData);
      setUploadResult({ success: true, ...res.data });
      toast.success("Document ingested into vector store!");
      fetchDocs();
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Upload failed.";
      setUploadResult({ success: false, error: detail });
      toast.error(detail);
    } finally {
      setIsUploading(false);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex h-screen bg-[#080808]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pl-[260px] pb-20 no-scrollbar">
        <div className="mx-auto max-w-5xl px-10 py-10">
          {/* Header */}
          <header className="mb-12">
            <div className="mb-3 flex items-center gap-3">
              <FolderLock className="h-5 w-5 text-[#f59e0b]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f59e0b]">
                {user?.ministry ? `${user.ministry} Ministry — Secure Knowledge Repository` : "Secure Knowledge Repository"}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-[#f5f5f5]">
              Document <span className="text-[#333] font-thin">/</span>{" "}
              <span className="text-[#a3a3a3]">Vault</span>
            </h1>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#525252]">
              {isAdmin ? "Upload classified documents · AI reads only your docs via RAG" : `Viewing documents for ${user?.ministry} Ministry · AI reads only your docs via RAG`}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Upload Panel (Admin Only) */}
            {isAdmin ? (
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
                  <h2 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f5f5f5]">
                    <Upload className="h-4 w-4 text-[#f59e0b]" />
                    Ingest Document
                  </h2>
                  <form onSubmit={handleUpload} className="space-y-4">
                    {/* Ministry */}
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#333]">
                        Ministry / Domain
                      </label>
                      <select
                        value={selectedMinistry}
                        onChange={(e) => setSelectedMinistry(e.target.value)}
                        className="w-full rounded-lg border border-[#222] bg-[#111] px-3 py-2.5 text-xs font-medium text-[#f5f5f5] focus:border-[#f59e0b]/50 focus:outline-none"
                      >
                        {MINISTRIES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    {/* Doc Type */}
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#333]">
                        Document Type
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full rounded-lg border border-[#222] bg-[#111] px-3 py-2.5 text-xs font-medium text-[#f5f5f5] focus:border-[#f59e0b]/50 focus:outline-none"
                      >
                        {["general", "policy", "report", "classified"].map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    {/* File */}
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#333]">
                        PDF File
                      </label>
                      <div
                        onClick={() => fileRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#333] bg-[#111] py-8 transition-colors hover:border-[#f59e0b]/30 hover:bg-[#111]"
                      >
                        <File className="mb-2 h-8 w-8 text-[#333]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#444]">
                          Click to Select File
                        </p>
                        <p className="mt-1 text-[9px] text-[#333]">PDF, TXT, DOCX supported</p>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".pdf,.txt,.docx"
                          className="hidden"
                          onChange={() => {}} // just triggers re-render
                        />
                      </div>
                      {fileRef.current?.files?.[0] && (
                        <p className="mt-2 truncate text-[9px] font-mono text-[#f59e0b]">
                          ↳ {fileRef.current.files[0].name}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 py-3 text-[10px] font-black uppercase tracking-widest text-[#f59e0b] transition-all hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/40 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Ingest into Vector Store</>
                      )}
                    </button>
                  </form>

                  {/* Upload Result */}
                  {uploadResult && (
                    <div className={cn(
                      "mt-4 rounded-xl border p-4 text-xs font-mono",
                      uploadResult.success
                        ? "border-green-500/20 bg-green-500/5 text-green-400"
                        : "border-red-500/20 bg-red-500/5 text-red-400"
                    )}>
                      {uploadResult.success ? (
                        <>
                          <div className="mb-2 flex items-center gap-2 font-black"><CheckCircle className="h-4 w-4" /> Ingestion Complete</div>
                          <p>Chunks: {uploadResult.chunks} · Pages: {uploadResult.pages}</p>
                          <p>Words: {uploadResult.total_words} · Language: {uploadResult.language?.toUpperCase()}</p>
                          {uploadResult.has_tables && <p>📊 Tables extracted</p>}
                          {uploadResult.is_scanned && <p>🔍 OCR applied (scanned PDF)</p>}
                        </>
                      ) : (
                        <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {uploadResult.error}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6 text-center">
                  <FolderLock className="mx-auto mb-3 h-10 w-10 text-[#333]" />
                  <p className="text-xs font-black uppercase tracking-widest text-[#444]">Admin Access Required</p>
                  <p className="mt-2 text-[10px] text-[#333]">Only administrators can upload documents to the vault.</p>
                </div>
              </div>
            )}

            {/* Documents List */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-[#222] bg-[#0e0e0e] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f5f5f5]">
                    <Database className="h-4 w-4 text-[#f59e0b]" />
                    Indexed Documents
                  </h2>
                  <button
                    onClick={fetchDocs}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg border border-[#222] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#525252] hover:text-[#a3a3a3] transition-colors"
                  >
                    <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin text-[#f59e0b]")} />
                    Refresh
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#f59e0b]" />
                  </div>
                ) : docs.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#222] text-center">
                    <FileText className="mb-3 h-8 w-8 text-[#222]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#333]">No Documents Yet</p>
                    <p className="mt-1 text-[9px] text-[#222]">Upload a PDF to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-[#1a1a1a] bg-[#111] px-4 py-3 transition-colors hover:border-[#222]">
                        <FileText className="h-5 w-5 shrink-0 text-[#f59e0b]" />
                        <div className="flex-1 truncate">
                          <p className="truncate text-[11px] font-bold text-[#f5f5f5]">{doc.filename}</p>
                          <p className="mt-0.5 text-[9px] font-mono text-[#525252]">
                            {doc.ministry} · {doc.chunk_count} chunks · by {doc.uploaded_by}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md border border-[#222] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#444]">
                          {doc.ministry}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
