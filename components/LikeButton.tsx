"use client";

import { useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { likeAction, unlikeAction } from "@/app/actions";

interface LikeButtonProps {
  id: number;
  likesCount: number;
}

const STORAGE_KEY = "curato_liked";

export default function LikeButton({ id, likesCount }: LikeButtonProps) {
  const liked = useSyncExternalStore(
    () => () => {},
    () => {
      const stored: number[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]",
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
    const stored: number[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (isLiked) {
      const updated = stored.filter((i) => i !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setLocalLiked(false);
      setCount((c: number) => c - 1);
      await unlikeAction(id);
    } else {
      stored.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
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
      className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
        isLiked
          ? "text-rose-400 hover:text-zinc-500 cursor-pointer"
          : "text-zinc-500 hover:text-rose-400 cursor-pointer"
      } ${animating ? "scale-125" : "scale-100"}`}
      aria-label={isLiked ? "Sacar like" : "Dar like"}>
      <Heart
        size={15}
        className={`transition-all ${isLiked ? "fill-rose-400" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
