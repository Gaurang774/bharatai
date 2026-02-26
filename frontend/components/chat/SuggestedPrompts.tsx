"use client";

import React from "react";
import { Zap, FileText, HelpCircle, Layout } from "lucide-react";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  {
    title: "Document Analysis",
    text: "Summarize the Digital India Act key provisions",
    icon: FileText,
  },
  {
    title: "Policy Drafting",
    text: "Draft a budget allocation memo for urban infrastructure",
    icon: Zap,
  },
  {
    title: "Legal Guidance",
    text: "RTI filing procedures for government infrastructure projects",
    icon: HelpCircle,
  },
  {
    title: "Scheme Details",
    text: "What are the eligibility criteria for the PMJAY health scheme?",
    icon: Layout,
  },
];

export const SuggestedPrompts = ({ onSelect }: { onSelect: (text: string) => void }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SUGGESTIONS.map((s, i) => (
        <motion.button
          key={s.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(s.text)}
          className="flex flex-col items-start gap-3 rounded-xl border border-[#222] bg-[#161616] p-4 text-left transition-all hover:border-[#f59e0b]/50 hover:bg-[#1c1c1c] group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] group-hover:bg-[#f59e0b]/20">
            <s.icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#525252] group-hover:text-[#f59e0b]">
              {s.title}
            </h4>
            <p className="mt-1 text-sm font-medium text-[#a3a3a3] group-hover:text-[#f5f5f5]">
              "{s.text}"
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
