"use client";

import { cn } from "../../lib/utils";
import { useState, type ReactNode } from "react";

interface TabsProps {
  tabs: { id: string; label: string; content: ReactNode }[];
  className?: string;
}

export function Tabs({ tabs, className }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className={className}>
      <div className="flex border-b border-border" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              active === tab.id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(
        (tab) =>
          active === tab.id && (
            <div key={tab.id} role="tabpanel" className="pt-4">
              {tab.content}
            </div>
          )
      )}
    </div>
  );
}
