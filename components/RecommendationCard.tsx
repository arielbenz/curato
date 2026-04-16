"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Trash2 } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import ReactionsBar from "@/components/ReactionsBar";
import CommentsList from "@/components/CommentsList";
import WatchedButton from "@/components/WatchedButton";
import ConfirmModal from "@/components/ConfirmModal";
import { type Recommendation, type Reaction, type Comment, type Watched } from "@/lib/db";
import { CATEGORY_COLORS, FRIEND_COLORS, CATEGORIES } from "@/lib/constants";
import { detectPlatform, PLATFORM_META } from "@/lib/platforms";
import { deleteAction } from "@/app/actions";

interface RecommendationCardProps {
  rec: Recommendation;
  reactions: Reaction[];
  comments: Comment[];
  watched: Watched[];
  priority?: boolean;
  currentUser?: string | null | undefined;
  listMode?: boolean;
  staggerIndex?: number;
  onDeleted?: () => void;
}

export default function RecommendationCard({ rec, reactions, comments, watched, priority = false, currentUser, listMode = false, staggerIndex = 0, onDeleted }: RecommendationCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const catLabel =
    CATEGORIES.find((c) => c.value === rec.category)?.label ?? rec.category;
  const catColor = CATEGORY_COLORS[rec.category] ?? CATEGORY_COLORS["otro"];
  const friendColor = FRIEND_COLORS[rec.recommended_by] ?? "text-zinc-400";
  const platform = detectPlatform(rec.url);

  const date = new Date(rec.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {confirmOpen && (
        <ConfirmModal
          message="¿Eliminás esta recomendación?"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          danger
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            setConfirmOpen(false);
            setDeleting(true);
            await deleteAction(rec.id, rec.recommended_by);
            onDeleted?.();
          }}
        />
      )}
      <div className={`group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up card-stagger-${staggerIndex + 1} ${listMode ? "flex flex-row gap-0" : "flex flex-col"}`}>
      {/* Thumbnail */}
      <a
        href={rec.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block relative bg-zinc-800 overflow-hidden shrink-0 ${listMode ? "w-40 h-full aspect-video" : "w-full aspect-video"}`}>
        {rec.thumbnail_url ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
            )}
            <Image
              src={rec.thumbnail_url}
              alt={rec.title}
              fill
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              onLoad={() => setImageLoaded(true)}
              className={`object-cover group-hover:brightness-110 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
            Sin preview
          </div>
        )}
        {platform !== "other" && (
          <span
            className={`absolute bottom-2 left-2 z-10 px-2 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md border border-white/10 ${PLATFORM_META[platform].textColor} shadow-lg`}>
            {PLATFORM_META[platform].label}
          </span>
        )}
      </a>

      {/* Content */}
      <div className={`flex flex-col flex-1 ${listMode ? "gap-2 p-4" : "gap-3 p-4 sm:gap-5 sm:p-7"}`}>
        {/* Category badge */}
        <span
          className={`self-start px-3 py-1 rounded-full text-xs border font-semibold tracking-wide ${catColor} shadow-sm`}>
          {catLabel}
        </span>

        {/* Title */}
        <a
          href={rec.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group/title flex items-start gap-1.5 text-zinc-100 font-bold leading-tight hover:text-white transition-colors ${listMode ? "text-base" : "text-base sm:text-xl"}`}>
          <span 
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              letterSpacing: '-0.02em'
            }}>
            {rec.title}
          </span>
          <ExternalLink
            size={14}
            className="mt-0.5 shrink-0 opacity-0 group-hover/title:opacity-70 group-hover/title:translate-x-0.5 transition-all"
          />
        </a>

        {/* Description */}
        {rec.description && !listMode && (
          <p 
            className="hidden sm:block text-sm text-zinc-400 leading-normal"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
            {rec.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 mt-auto pt-3 sm:pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-medium ${friendColor}`}>
                {rec.recommended_by}
              </span>
              <span className="text-xs text-zinc-600">{date}</span>
            </div>
            <div className="flex items-center gap-3">
              {currentUser === rec.recommended_by && (
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                  className="text-zinc-600 hover:text-rose-400 transition-colors disabled:opacity-40"
                  aria-label="Eliminar recomendación"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <LikeButton id={rec.id} likesCount={rec.likes_count} currentUser={currentUser ?? null} />
            </div>
          </div>
          
          {/* Watched */}
          <WatchedButton recommendationId={rec.id} watched={watched} currentUser={currentUser ?? null} />
          
          {/* Reactions */}
          <ReactionsBar recommendationId={rec.id} reactions={reactions} currentUser={currentUser ?? null} />
          
          {/* Comments */}
          <CommentsList recommendationId={rec.id} comments={comments} currentUser={currentUser ?? null} />
        </div>
      </div>
    </div>
    </>
  );
}
