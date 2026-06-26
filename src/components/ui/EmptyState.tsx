import { Info } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface EmptyStateProps {
  title: string;
  description: string;
  items?: string[];
}

export function EmptyState({ title, description, items }: EmptyStateProps) {
  return (
    <GlassCard className="text-center py-10">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <Info className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">{description}</p>
      {items && items.length > 0 && (
        <ul className="text-left text-sm text-zinc-400 max-w-xs mx-auto space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
