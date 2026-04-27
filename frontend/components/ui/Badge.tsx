import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#161616] text-[#f5f5f5] border-[#222]",
        amber:
          "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]",
        success:
          "border-green-500/30 bg-green-500/10 text-green-500",
        danger:
          "border-red-500/30 bg-red-500/10 text-red-500",
        outline: "text-[#a3a3a3] border-[#222]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: "default" | "amber" | "success" | "danger" | "outline" | null;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
