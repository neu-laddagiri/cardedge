"use client";

import { cn } from "@/lib/utils";

export interface ToolTab<T extends string> {
  id: T;
  label: string;
}

export function ToolTabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: ToolTab<T>[];
  active: T;
  onChange: (tab: T) => void;
  label: string;
}) {
  return (
    <div className="tool-tabs" role="group" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn("tool-tab", active === tab.id && "tool-tab-active")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
