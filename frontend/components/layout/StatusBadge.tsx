import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "secure" | "sovereign" | "online" | "warning";
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const configs = {
    secure: {
      label: "Secure",
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    sovereign: {
      label: "Sovereign Mode",
      color: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/20",
    },
    online: {
      label: "Online",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    warning: {
      label: "Sensitive",
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
  };

  const config = configs[status];

  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
      config.bg, config.color, config.border, className
    )}>
      <span className={cn("h-1 w-1 rounded-full animate-pulse", config.color.replace("text", "bg"))} />
      {config.label}
    </div>
  );
};
