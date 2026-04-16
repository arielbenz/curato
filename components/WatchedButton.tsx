"use client";

import { useOptimistic, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Watched } from "@/lib/db";
import { toggleWatchedAction } from "@/app/actions";

interface WatchedButtonProps {
  recommendationId: number;
  watched: Watched[];
  currentUser: string | null;
}

export default function WatchedButton({ recommendationId, watched, currentUser }: WatchedButtonProps) {
  const [optimisticWatched, setOptimisticWatched] = useOptimistic(watched);
  const [isPending, startTransition] = useTransition();
  
  const isWatched = optimisticWatched.some(w => w.user_name === currentUser);
  const count = optimisticWatched.length;

  function handleToggle() {
    if (!currentUser) return;
    
    startTransition(async () => {
      if (isWatched) {
        setOptimisticWatched(optimisticWatched.filter(w => w.user_name !== currentUser));
      } else {
        setOptimisticWatched([...optimisticWatched, {
          id: 0,
          recommendation_id: recommendationId,
          user_name: currentUser,
          created_at: new Date().toISOString(),
        }]);
      }
      
      await toggleWatchedAction(recommendationId, currentUser);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={!currentUser || isPending}
      title={isWatched ? "Marcar como no visto" : "Marcar como visto"}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
        isWatched
          ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm hover:bg-green-500/30 scale-105"
          : "bg-zinc-800/70 text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-800 hover:scale-105"
      } ${!currentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}>
      {isWatched ? <Eye size={15} strokeWidth={2.5} /> : <EyeOff size={15} strokeWidth={2} />}
      <span>{isWatched ? "Visto" : "No visto"}</span>
      {count > 0 && <span className="font-bold tabular-nums">({count})</span>}
    </button>
  );
}
