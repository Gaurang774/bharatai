import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#f59e0b] text-black hover:bg-[#d97706] amber-glow border border-[#f59e0b]/20",
        outline:
          "border border-[#222] bg-transparent hover:bg-[#1c1c1c] hover:border-[#333] text-[#f5f5f5]",
        secondary:
          "bg-[#161616] text-[#f5f5f5] hover:bg-[#1c1c1c] border border-[#222]",
        ghost: "hover:bg-[#1c1c1c] text-[#a3a3a3] hover:text-[#f5f5f5]",
        danger: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  variant?: "primary" | "outline" | "secondary" | "ghost" | "danger" | null;
  size?: "default" | "sm" | "lg" | "icon" | null;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && children}
        {isLoading && "Processing..."}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
