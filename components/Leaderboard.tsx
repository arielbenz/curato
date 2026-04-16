import type { Recommendation } from "@/lib/db";
import { FRIEND_COLORS } from "@/lib/constants";

interface LeaderboardProps {
  recommendations: Recommendation[];
}

const FRIEND_BAR_COLORS: Record<string, string> = {
  Ariel: "bg-orange-400",
  Mauro: "bg-cyan-400",
  Fernando: "bg-pink-400",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ recommendations }: LeaderboardProps) {
  const counts = recommendations.reduce<Record<string, number>>((acc, r) => {
    acc[r.recommended_by] = (acc[r.recommended_by] ?? 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const max = sorted[0]?.[1] ?? 1;

  if (sorted.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-5 shadow-lg">
      <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
        Podio
      </h2>
      <div className="flex flex-col gap-4">
        {sorted.map(([name, count], i) => {
          const textColor = FRIEND_COLORS[name] ?? "text-zinc-400";
          const barColor = FRIEND_BAR_COLORS[name] ?? "bg-zinc-400";
          const pct = Math.round((count / max) * 100);
          const isFirst = i === 0;
          return (
            <div key={name} className={`flex flex-col gap-2 ${isFirst ? "scale-105" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">{MEDALS[i] ?? ""}</span>
                  <span className={`text-sm font-bold ${textColor}`}>{name}</span>
                </div>
                <span className="text-xs tabular-nums font-semibold text-zinc-400">
                  {count} {count === 1 ? "rec" : "recs"}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out ${isFirst ? "shadow-lg" : ""}`}
                  style={{ 
                    width: `${pct}%`,
                    boxShadow: isFirst ? '0 0 20px currentColor' : 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
