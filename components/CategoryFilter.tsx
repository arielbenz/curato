"use client";

import { CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  selected: string;
  onChange: (cat: string) => void;
  counts?: Record<string, number>;
  total?: number;
}

export default function CategoryFilter({
  selected,
  onChange,
  counts = {},
  total = 0,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors text-left ${
          selected === "all"
            ? "bg-zinc-300 text-zinc-900 border-zinc-300"
            : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
        }`}>
        Todos
        <span className={`text-xs font-medium tabular-nums ${selected === "all" ? "text-zinc-600" : "text-zinc-600"}`}>
          {total}
        </span>
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors text-left ${
            selected === cat.value
              ? "bg-zinc-300 text-zinc-900 border-zinc-300"
              : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
          }`}>
          {cat.label}
          <span className="text-xs font-medium tabular-nums text-zinc-600">
            {counts[cat.value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
