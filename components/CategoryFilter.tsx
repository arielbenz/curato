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
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border font-semibold transition-all duration-200 text-left ${
          selected === "all"
            ? "bg-linear-to-r from-orange-500 to-pink-600 text-white border-transparent shadow-lg scale-105"
            : "bg-zinc-900/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 hover:scale-105"
        }`}>
        Todos
        <span
          className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${selected === "all" ? "bg-white/20" : "bg-zinc-800"}`}>
          {total}
        </span>
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border font-semibold transition-all duration-200 text-left ${
            selected === cat.value
              ? "bg-linear-to-r from-orange-500 to-pink-600 text-white border-transparent shadow-lg scale-105"
              : "bg-zinc-900/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 hover:scale-105"
          }`}>
          {cat.label}
          <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${selected === cat.value ? "bg-white/20" : "bg-zinc-800"}`}>
            {counts[cat.value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
