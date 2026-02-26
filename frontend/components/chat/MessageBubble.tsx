"use client";

import React from "react";
import { Copy, FileText, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  is_flagged?: boolean;
  sensitivity_level?: string;
  rag_doc_count?: number;
  rag_confidence?: number;
}

export const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className={cn(
        "group flex w-full flex-col gap-2 py-4",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div className="flex items-center gap-2 px-1">
        {!isUser && (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#f59e0b]/10 text-[#f59e0b]">
              <Shield className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5f5f5]">
              BharatAI
            </span>
          </div>
        )}
        {isUser && (
          <Badge variant="amber" className="h-4 px-1.5 text-[8px] uppercase">
            Finance Ministry
          </Badge>
        )}
        <span className="text-[10px] font-medium text-[#525252]">
          {message.timestamp || "12:45 PM"}
        </span>
      </div>

      <div
        className={cn(
          "relative max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all",
          isUser
            ? "bg-[#1a1200] border border-[#f59e0b]/20 text-[#f5f5f5] rounded-tr-none"
            : "bg-[#161616] border border-[#222] text-[#f5f5f5] rounded-tl-none hover:border-[#333]"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && (
          <div className="mt-3 flex items-center justify-between border-t border-[#222] pt-2">
            <div className="flex items-center gap-2">
              {message.rag_doc_count && message.rag_doc_count > 0 ? (
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#f59e0b]/70 uppercase tracking-tighter">
                  <FileText className="h-3 w-3" />
                  Sourced from {message.rag_doc_count} docs ({message.rag_confidence}%)
                </div>
              ) : (
                <div className="text-[9px] font-medium text-[#525252] uppercase tracking-tighter italic">
                  General Knowledge Base
                </div>
              )}
            </div>
            
            <button
              onClick={handleCopy}
              className="rounded p-1 text-[#525252] opacity-0 transition-opacity hover:bg-[#1c1c1c] hover:text-[#f5f5f5] group-hover:opacity-100"
            >
              {copied ? <Check className="h-3.2 w-3.2 text-green-500" /> : <Copy className="h-3.2 w-3.2" />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
