"use client";

import { useOptimistic, useTransition } from "react";
import type { Reaction, ReactionType } from "@/lib/db";
import { addReactionAction, removeReactionAction } from "@/app/actions";

interface ReactionsBarProps {
  recommendationId: number;
  reactions: Reaction[];
  currentUser: string | null;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  fire: "🔥",
  mind_blown: "🤯",
  laugh: "😂",
  poop: "💩",
};

const REACTION_LABELS: Record<ReactionType, string> = {
  fire: "Increíble",
  mind_blown: "Me voló la cabeza",
  laugh: "Mortal",
  poop: "Malísima",
};

export default function ReactionsBar({ recommendationId, reactions, currentUser }: ReactionsBarProps) {
  const [optimisticReactions, setOptimisticReactions] = useOptimistic(reactions);
  const [isPending, startTransition] = useTransition();
  
  const currentUserReaction = optimisticReactions.find(r => r.user_name === currentUser);
  
  const counts = optimisticReactions.reduce((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  function handleReaction(type: ReactionType) {
    if (!currentUser) return;
    
    startTransition(async () => {
      if (currentUserReaction?.reaction_type === type) {
        // Remove reaction
        setOptimisticReactions(optimisticReactions.filter(r => r.user_name !== currentUser));
        await removeReactionAction(recommendationId, currentUser);
      } else {
        // Add/change reaction
        const newReactions = optimisticReactions.filter(r => r.user_name !== currentUser);
        newReactions.push({
          id: 0,
          recommendation_id: recommendationId,
          user_name: currentUser,
          reaction_type: type,
          created_at: new Date().toISOString(),
        });
        setOptimisticReactions(newReactions);
        await addReactionAction(recommendationId, currentUser, type);
      }
    });
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map(type => {
        const count = counts[type] || 0;
        const isActive = currentUserReaction?.reaction_type === type;
        
        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={!currentUser || isPending}
            title={REACTION_LABELS[type]}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-zinc-700 border border-zinc-600 shadow-md scale-110"
                : "bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 hover:scale-105"
            } ${!currentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}>
            <span className="text-base leading-none">{REACTION_EMOJIS[type]}</span>
            {count > 0 && <span className="text-zinc-400 font-bold tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
