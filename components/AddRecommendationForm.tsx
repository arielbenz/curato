"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { X, Link, Loader2, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { Friend } from "@/lib/constants";
import { addRecommendationAction, fetchUrlMetadata } from "@/app/actions";
import { getYouTubeId } from "@/lib/thumbnails";

interface AddRecommendationFormProps {
  onClose: () => void;
  currentUser: Friend;
}

export default function AddRecommendationForm({
  onClose,
  currentUser,
}: AddRecommendationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Fast thumbnail preview for YouTube (client-side, no fetch needed)
  useEffect(() => {
    const ytId = getYouTubeId(url);
    if (ytId) {
      setPreviewThumb(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
    } else {
      setPreviewThumb(null);
    }
  }, [url]);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addRecommendationAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-zinc-100 font-semibold text-base">
            Agregar recomendación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex flex-col gap-4 px-5 py-5 overflow-y-auto">
          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              URL *
            </label>
            <div className="relative">
              <Link
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
              <input
                name="url"
                type="url"
                required
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={async (e) => {
                  const val = e.target.value.trim();
                  if (!val || title) return;
                  setIsFetchingMeta(true);
                  try {
                    const meta = await fetchUrlMetadata(val);
                    if (meta.title) setTitle(meta.title);
                    if (meta.description) setDescription(meta.description);
                  } finally {
                    setIsFetchingMeta(false);
                  }
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            {/* Thumbnail preview */}
            {previewThumb && (
              <div className="mt-1 rounded-lg overflow-hidden border border-zinc-700 aspect-video relative bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewThumb}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              Título *
              {isFetchingMeta && (
                <Loader2 size={11} className="animate-spin text-zinc-500" />
              )}
              {!isFetchingMeta && title && (
                <Sparkles size={11} className="text-zinc-500" />
              )}
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="Nombre del video / documental / película"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              Descripción
              <span className="normal-case text-zinc-600 ml-1">(opcional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="¿Por qué lo recomendás?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
              Categoría *
            </label>
            <select
              name="category"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors">
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario oculto */}
          <input type="hidden" name="recommended_by" value={currentUser} />

          {/* Error */}
          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 w-full bg-zinc-100 hover:bg-white text-zinc-900 font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1">
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Guardando...
              </>
            ) : (
              "Agregar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
