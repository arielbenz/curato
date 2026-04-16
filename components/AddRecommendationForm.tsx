"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { X, Link, Loader2, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { Friend } from "@/lib/constants";
import { addRecommendationAction, fetchUrlMetadata, fetchThumbnailPreview } from "@/app/actions";
import { getYouTubeId } from "@/lib/thumbnails";

interface AddRecommendationFormProps {
  onClose: () => void;
  currentUser: Friend;
  onAdded?: () => void;
}

export default function AddRecommendationForm({
  onClose,
  currentUser,
  onAdded,
}: AddRecommendationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  const [isFetchingThumb, setIsFetchingThumb] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Thumbnail preview (YouTube fast path client-side, others via server)
  useEffect(() => {
    if (!url.trim()) {
      setPreviewThumb(null);
      return;
    }

    // YouTube fast path (client-side)
    const ytId = getYouTubeId(url);
    if (ytId) {
      setPreviewThumb(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      return;
    }

    // For other platforms (Spotify, etc), fetch from server
    let cancelled = false;
    const fetchThumb = async () => {
      setIsFetchingThumb(true);
      try {
        const thumb = await fetchThumbnailPreview(url);
        if (!cancelled && thumb) {
          setPreviewThumb(thumb);
        } else if (!cancelled) {
          setPreviewThumb(null);
        }
      } catch {
        if (!cancelled) setPreviewThumb(null);
      } finally {
        if (!cancelled) setIsFetchingThumb(false);
      }
    };

    const timer = setTimeout(fetchThumb, 800); // Debounce
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
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
      onAdded?.();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-0 pt-20 sm:p-4 sm:pt-20 bg-black/80 backdrop-blur-md overflow-y-auto animate-scale-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="w-full sm:max-w-lg glass-modal border border-zinc-700/50 rounded-2xl shadow-2xl max-h-[calc(100dvh-6rem)] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700/50 shrink-0">
          <h2 className="text-zinc-100 font-bold text-lg tracking-tight">
            Agregar recomendación
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 p-1.5 rounded-lg transition-all">
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
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800 transition-all"
              />
            </div>
            {/* Thumbnail preview */}
            {(previewThumb || isFetchingThumb) && (
              <div className="mt-1 rounded-lg overflow-hidden border border-zinc-700/50 aspect-video relative bg-zinc-800/50 backdrop-blur-sm shadow-lg">
                {isFetchingThumb ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-orange-400" />
                  </div>
                ) : (
                  previewThumb && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewThumb}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  )
                )}
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
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800 transition-all"
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
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800 transition-all resize-none"
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
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800 transition-all">
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
            className="ripple flex items-center justify-center gap-2 w-full bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold py-3 rounded-lg text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
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
