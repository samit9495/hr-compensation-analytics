import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SummaryListItem = {
  key: string;
  label: ReactNode;
  value: ReactNode;
};

type Props = {
  items: SummaryListItem[];
  ariaLabel?: string;
  className?: string;
};

export function SummaryList({ items, ariaLabel, className }: Props) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        "divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white text-sm",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-3 px-3 py-2 transition hover:bg-slate-50"
        >
          <span className="min-w-0 truncate font-medium text-slate-800">
            {item.label}
          </span>
          <span className="flex shrink-0 items-center gap-2 text-right tabular-nums text-slate-600">
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
