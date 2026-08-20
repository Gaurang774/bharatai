"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getToken } from "@/lib/auth";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/audit/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `bharatai_audit_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Audit log exported successfully.", { icon: "📂" });
    } catch (err) {
      toast.error("Export failed. Check your admin permissions.");
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
