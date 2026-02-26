"use client";

import { motion } from "framer-motion";

export const TypingIndicator = () => {
  return (
    <div className="flex flex-col gap-2 py-4 items-start">
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#525252] animate-pulse">
          BharatAI is processing
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-[#161616] border border-[#222] px-3 py-2 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="h-1 w-1 rounded-full bg-[#f59e0b]"
          />
        ))}
      </div>
    </div>
  );
};
