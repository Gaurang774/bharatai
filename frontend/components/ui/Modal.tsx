"use client";

import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  showClose = true,
}: ModalProps) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full max-w-lg overflow-hidden rounded-xl border border-[#222] bg-[#111] shadow-2xl",
              className
            )}
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent" />
            
            {(title || showClose) && (
              <div className="flex items-center justify-between border-b border-[#222] px-6 py-4">
                <h3 className="text-lg font-semibold text-[#f5f5f5]">{title}</h3>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-[#525252] hover:bg-[#1c1c1c] hover:text-[#f5f5f5]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
