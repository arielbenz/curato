"use client";

import { PLATFORM_META, type Platform } from "@/lib/platforms";

interface PlatformFilterProps {
  platforms: Platform[];
  selected: Platform | "all";
  onChange: (platform: Platform | "all") => void;
  counts?: Record<string, number>;
  total?: number;
}

export default function PlatformFilter({
  platforms,
  selected,
  onChange,
  counts = {},
  total = 0,
}: PlatformFilterProps) {
  if (platforms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border font-semibold transition-all duration-200 text-left ${
          selected === "all"
            ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg scale-105"
            : "bg-zinc-900/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 hover:scale-105"
        }`}>
        Todas
        <span
          className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${selected === "all" ? "bg-white/20" : "bg-zinc-800"}`}>
          {total}
        </span>
      </button>
      {platforms.map((platform) => {
        const meta = PLATFORM_META[platform];
        return (
          <button
            key={platform}
            onClick={() => onChange(platform)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border font-semibold transition-all duration-200 text-left ${
              selected === platform
                ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg scale-105"
                : "bg-zinc-900/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 hover:scale-105"
            }`}>
            {meta.label}
            <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${selected === platform ? "bg-white/20" : "bg-zinc-800"}`}>
              {counts[platform] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
