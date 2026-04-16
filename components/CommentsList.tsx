"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send } from "lucide-react";
import type { Comment } from "@/lib/db";
import { FRIEND_COLORS } from "@/lib/constants";
import { addCommentAction } from "@/app/actions";

interface CommentsListProps {
  recommendationId: number;
  comments: Comment[];
  currentUser: string | null;
}

export default function CommentsList({ recommendationId, comments, currentUser }: CommentsListProps) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !currentUser || isPending) return;
    
    startTransition(async () => {
      await addCommentAction(recommendationId, currentUser, text);
      setText("");
    });
  }

  if (!expanded && comments.length === 0) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-all hover:scale-105 active:scale-95">
        <MessageCircle size={15} strokeWidth={2} />
        <span>Agregar comentario</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-zinc-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-300 transition-all hover:scale-105 active:scale-95 self-start">
        <MessageCircle size={15} strokeWidth={2} />
        <span>{comments.length} {comments.length === 1 ? "comentario" : "comentarios"}</span>
      </button>

      {expanded && (
        <>
          {comments.length > 0 && (
            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto animate-fade-in-up">
              {comments.map(comment => {
                const userColor = FRIEND_COLORS[comment.user_name] || "text-zinc-400";
                const date = new Date(comment.created_at).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                });
                
                return (
                  <div key={comment.id} className="flex flex-col gap-1 text-xs bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-800">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-bold text-sm ${userColor}`}>{comment.user_name}</span>
                      <span className="text-zinc-600 text-[10px]">{date}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{comment.text}</p>
                  </div>
                );
              })}
            </div>
          )}

          {currentUser && (
            <form onSubmit={handleSubmit} className="flex gap-2 animate-fade-in-up">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribí un comentario..."
                maxLength={500}
                className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800 transition-all"
              />
              <button
                type="submit"
                disabled={!text.trim() || isPending}
                className="ripple p-2 bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
                <Send size={16} strokeWidth={2.5} className="text-white" />
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
