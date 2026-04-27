"use client";

import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface SensitiveWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  keywords: string[];
}

export const SensitiveWarning = ({
  isOpen,
  onClose,
  onConfirm,
  keywords,
}: SensitiveWarningProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md border-red-500/30"
      showClose={false}
    >
      <div className="relative overflow-hidden pt-4">
        {/* Red Warning Edge */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
        
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#f5f5f5]">
            Sensitive Content Detected
          </h2>
          <p className="mt-2 text-sm text-[#a3a3a3]">
            Our sovereign firewall has flagged your query for restricted terms.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-red-500/70">
            Detected restricted tokens:
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((word) => (
              <span
                key={word}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-red-500 animate-pulse"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded border border-[#222] bg-[#1a0808] p-3">
          <div className="flex gap-3">
            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-[#a3a3a3]">
              <span className="font-bold text-red-500">PROTOCOL NOTICE:</span> This interaction will be logged and flagged for real-time review by the Ministry Security Officer. Unauthorized disclosure is a punishable offense.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="danger"
            onClick={onConfirm}
            className="w-full font-bold uppercase tracking-widest"
          >
            Acknowledge & Proceed
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-xs"
          >
            Cancel Interaction
          </Button>
        </div>
      </div>
    </Modal>
  );
};
