"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-500/30",
  secondary:
    "glass-panel hover:bg-white/8 text-zinc-200 border border-white/10",
  ghost: "hover:bg-white/5 text-zinc-300",
  danger:
    "bg-red-600/80 hover:bg-red-500 text-white border border-red-500/30",
  gold:
    "bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 text-[#c9a84c] border border-[#c9a84c]/30",
};

const sizes = {
  sm: "min-h-11 px-3 py-2 text-xs rounded-xl",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
  lg: "min-h-12 px-6 py-3 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
