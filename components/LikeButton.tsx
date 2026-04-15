"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { likeAction } from "@/app/actions";

interface LikeButtonProps {
  id: number;
  likesCount: number;
}

const STORAGE_KEY = "curato_liked";

export default function LikeButton({ id, likesCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likesCount);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const stored: number[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    setLiked(stored.includes(id));
  }, [id]);

  async function handleLike() {
    if (liked) return;
    const stored: number[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    stored.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setLiked(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);
    await likeAction(id);
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
        liked
          ? "text-rose-400 cursor-default"
          : "text-zinc-500 hover:text-rose-400 cursor-pointer"
      } ${animating ? "scale-125" : "scale-100"}`}
      aria-label={liked ? "Ya le diste like" : "Dar like"}
    >
      <Heart
        size={15}
        className={`transition-all ${liked ? "fill-rose-400" : ""}`}
      />
      <span>{count}</span>
    </button>
  );
}
