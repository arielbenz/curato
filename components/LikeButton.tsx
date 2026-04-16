"use client";

import { useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { likeAction, unlikeAction } from "@/app/actions";

interface LikeButtonProps {
  id: number;
  likesCount: number;
  currentUser?: string | null;
}

function storageKey(user?: string | null) {
  return user ? `curato_liked_${user}` : "curato_liked";
}

export default function LikeButton({ id, likesCount, currentUser }: LikeButtonProps) {
  const liked = useSyncExternalStore(
    () => () => {},
    () => {
      const stored: number[] = JSON.parse(
        localStorage.getItem(storageKey(currentUser)) ?? "[]",
      );
      return stored.includes(id);
    },
    () => false,
  );
  const [localLiked, setLocalLiked] = useState(false);
  const isLiked = localLiked || liked;
  const [count, setCount] = useState(likesCount);
  const [animating, setAnimating] = useState(false);

  async function handleLike() {
    const key = storageKey(currentUser);
    const stored: number[] = JSON.parse(
      localStorage.getItem(key) ?? "[]",
    );
    if (isLiked) {
      const updated = stored.filter((i) => i !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      setLocalLiked(false);
      setCount((c: number) => c - 1);
      await unlikeAction(id);
    } else {
      stored.push(id);
      localStorage.setItem(key, JSON.stringify(stored));
      setLocalLiked(true);
      setCount((c: number) => c + 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
      await likeAction(id);
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 ${
        isLiked
          ? "text-rose-400 hover:text-rose-300 cursor-pointer scale-105"
          : "text-zinc-500 hover:text-rose-400 cursor-pointer hover:scale-105"
      } ${animating ? "animate-pulse scale-125" : "scale-100"} active:scale-95`}
      aria-label={isLiked ? "Sacar like" : "Dar like"}>
      <Heart
        size={16}
        strokeWidth={2.5}
        className={`transition-all duration-200 ${isLiked ? "fill-rose-400" : ""} ${animating ? "drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]" : ""}`}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
