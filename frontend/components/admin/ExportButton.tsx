"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminApi } from "@/lib/api";
import toast from "react-hot-toast";

export const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    try {
        const url = adminApi.exportLogs();
        window.open(url, '_blank');
        toast.success("Audit report export initiated.", {
            icon: "📂"
        });
    } catch (err) {
        toast.error("Failed to export logs.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      isLoading={isExporting}
      className="gap-2 h-9 px-4 border-[#222] hover:border-[#f59e0b]/30"
    >
      {!isExporting && <Download className="h-3.5 w-3.5 text-[#f59e0b]" />}
      Export Terminal Logs
    </Button>
  );
};
