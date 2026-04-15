"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Trash2 } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import ConfirmModal from "@/components/ConfirmModal";
import { type Recommendation } from "@/lib/db";
import { CATEGORY_COLORS, FRIEND_COLORS, CATEGORIES } from "@/lib/constants";
import { deleteAction } from "@/app/actions";

interface RecommendationCardProps {
  rec: Recommendation;
  priority?: boolean;
  currentUser?: string | null;
  listMode?: boolean;
  onDeleted?: () => void;
}

export default function RecommendationCard({ rec, priority = false, currentUser, listMode = false, onDeleted }: RecommendationCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const catLabel =
    CATEGORIES.find((c) => c.value === rec.category)?.label ?? rec.category;
  const catColor = CATEGORY_COLORS[rec.category] ?? CATEGORY_COLORS["otro"];
  const friendColor = FRIEND_COLORS[rec.recommended_by] ?? "text-zinc-400";

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
      <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors ${listMode ? "flex flex-row gap-0" : "flex flex-col"}`}>
      {/* Thumbnail */}
      <a
        href={rec.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block relative bg-zinc-800 overflow-hidden shrink-0 ${listMode ? "w-40 h-full aspect-video" : "w-full aspect-video"}`}>
        {rec.thumbnail_url ? (
          <Image
            src={rec.thumbnail_url}
            alt={rec.title}
            fill
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
            Sin preview
          </div>
        )}
      </a>

      {/* Content */}
      <div className={`flex flex-col flex-1 ${listMode ? "gap-2 p-4" : "gap-5 p-7"}`}>
        {/* Category badge */}
        <span
          className={`self-start px-2 py-0.5 rounded-full text-xs border font-medium ${catColor}`}>
          {catLabel}
        </span>

        {/* Title */}
        <a
          href={rec.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-start gap-1 text-zinc-100 font-semibold leading-snug hover:text-white ${listMode ? "text-base" : "text-xl"}`}>
          <span>{rec.title}</span>
          <ExternalLink
            size={13}
            className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
          />
        </a>

        {/* Description */}
        {rec.description && !listMode && (
          <p className="text-base text-zinc-400 leading-relaxed line-clamp-5">
            {rec.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
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
            <LikeButton id={rec.id} likesCount={rec.likes_count} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
