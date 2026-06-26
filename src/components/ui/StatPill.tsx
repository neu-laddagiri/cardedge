import { cn } from "@/lib/utils";

interface StatPillProps {
  label: string;
  value: string | number;
  variant?: "default" | "emerald" | "gold" | "red" | "amber";
  className?: string;
}

const variantStyles = {
  default: "border-white/10 text-zinc-300",
  emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  gold: "border-[#c9a84c]/30 text-[#c9a84c] bg-[#c9a84c]/10",
  red: "border-red-500/30 text-red-400 bg-red-500/10",
  amber: "border-amber-500/30 text-amber-400 bg-amber-500/10",
};

export function StatPill({
  label,
  value,
  variant = "default",
  className,
}: StatPillProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-xl border px-3 py-2",
        variantStyles[variant],
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}
