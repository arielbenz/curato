"use client";

import { CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  selected: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors text-left ${
          selected === "all"
            ? "bg-zinc-300 text-zinc-900 border-zinc-300"
            : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
        }`}>
        Todos
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors text-left ${
            selected === cat.value
              ? "bg-zinc-300 text-zinc-900 border-zinc-300"
              : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"
          }`}>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
