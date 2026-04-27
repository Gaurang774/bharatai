"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip = ({ content, children, className }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bottom-full left-1/2 z-[60] mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#222] bg-[#161616] px-2.5 py-1.5 text-xs font-medium text-[#f5f5f5] shadow-xl",
              className
            )}
          >
            {content}
            <div className="absolute top-full left-1/2 -ml-1 h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-[#222]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
