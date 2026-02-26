"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, ShieldCheck, X, FileText, Globe2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface AttachedFile {
  file: File;
  preview?: string;
}

interface ChatInputProps {
  onSend: (message: string, options: { language: string; file?: File }) => void;
  isLoading: boolean;
}

const LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Hindi", label: "हिंदी (Hindi)" },
];

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input, { language, file: attachedFile?.file });
      setInput("");
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile({ file });
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="relative px-6 py-4">
      {/* Attached File Preview */}
      {attachedFile && (
        <div className="mx-auto mb-2 flex max-w-4xl items-center gap-2 rounded-xl border border-[#222] bg-[#111] px-4 py-2.5">
          <FileText className="h-4 w-4 shrink-0 text-[#f59e0b]" />
          <span className="flex-1 truncate text-xs font-medium text-[#a3a3a3]">
            {attachedFile.file.name}
          </span>
          <span className="text-[10px] font-mono text-[#333]">
            {(attachedFile.file.size / 1024).toFixed(1)} KB
          </span>
          <button
            onClick={() => setAttachedFile(null)}
            className="ml-1 rounded p-0.5 text-[#525252] hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="relative mx-auto max-w-4xl rounded-2xl border border-[#222] bg-[#111] p-1 shadow-2xl focus-within:border-[#f59e0b]/50 focus-within:ring-1 focus-within:ring-[#f59e0b]/20">
        <div className="flex flex-col">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === "Hindi"
                ? "BharatAI से अपने मंत्रालय के बारे में कुछ भी पूछें..."
                : "Ask BharatAI anything about your ministry..."
            }
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-[#f5f5f5] placeholder-[#525252] outline-none"
            style={{ minHeight: "44px" }}
          />

          <div className="flex items-center justify-between px-4 py-2 border-t border-[#222]/50">
            <div className="flex items-center gap-3">
              {/* File Attachment */}
              <button
                title="Attach a document"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-lg p-1.5 text-[#525252] hover:bg-[#1c1c1c] hover:text-[#a3a3a3]",
                  attachedFile && "text-[#f59e0b]"
                )}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx,.csv"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="h-4 w-[1px] bg-[#222]" />

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest",
                    language === "Hindi"
                      ? "border-[#f59e0b]/30 bg-[#f59e0b]/5 text-[#f59e0b]"
                      : "border-[#222] bg-transparent text-[#525252] hover:text-[#a3a3a3] hover:border-[#333]"
                  )}
                >
                  <Globe2 className="h-3 w-3" />
                  {currentLang.label}
                  <ChevronDown
                    className={cn("h-3 w-3 opacity-50", langOpen && "rotate-180")}
                  />
                </button>

                {langOpen && (
                  <div className="absolute bottom-full left-0 mb-2 min-w-[160px] rounded-xl border border-[#222] bg-[#111] shadow-2xl overflow-hidden z-50">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-[#1c1c1c]",
                          language === lang.code
                            ? "text-[#f59e0b]"
                            : "text-[#525252]"
                        )}
                      >
                        {lang.code === "Hindi" && (
                          <span className="text-[10px] font-mono opacity-60">हि</span>
                        )}
                        {lang.label}
                        {language === lang.code && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-4 w-[1px] bg-[#222]" />

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#525252] uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Encrypted
              </div>
            </div>

            <div className="flex items-center gap-3">
              {input.length > 100 && (
                <span className="text-[10px] font-mono font-medium text-[#525252]">
                  {input.length} ch
                </span>
              )}
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="h-8 gap-2 rounded-lg px-3 text-[10px] font-bold uppercase tracking-widest"
              >
                {language === "Hindi" ? "भेजें" : "Send"}
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="flex items-center justify-center gap-1 text-[10px] font-medium text-[#333] uppercase lg:gap-2">
          <span>NIC Sovereign Infrastructure</span>
          <span className="h-1 w-1 rounded-full bg-[#333]" />
          <span>No External Data Sharing</span>
          <span className="h-1 w-1 rounded-full bg-[#333]" />
          <span>Logs: 365 Days</span>
        </p>
      </div>
    </div>
  );
};
