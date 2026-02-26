"use client";

import React, { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSelectPrompt: (text: string) => void;
  userEmail?: string;
}

export const ChatWindow = ({ messages, isLoading, onSelectPrompt, userEmail }: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar"
    >
      <div className="mx-auto max-w-4xl">
        {messages.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#f59e0b]/5 text-[#f59e0b] amber-glow"
            >
              <span className="text-4xl">⚡</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black tracking-tight text-[#f5f5f5]"
            >
              Good morning, {userEmail ? userEmail.split('@')[0] : "Officer"}.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-sm font-medium text-[#525252] uppercase tracking-[0.2em]"
            >
              National Intelligence Framework Active
            </motion.p>

            <div className="mt-16 w-full">
              <SuggestedPrompts onSelect={onSelectPrompt} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Session Started Divider */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#222]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#333]">
                Analysis Session Initiated
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#222]" />
            </div>

            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg as any} />
            ))}
            
            {isLoading && <TypingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
};
