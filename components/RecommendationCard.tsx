import Image from "next/image";
import { ExternalLink } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { type Recommendation } from "@/lib/db";
import { CATEGORY_COLORS, FRIEND_COLORS, CATEGORIES } from "@/lib/constants";

interface RecommendationCardProps {
  rec: Recommendation;
}

export default function RecommendationCard({ rec }: RecommendationCardProps) {
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-zinc-700 transition-colors">
      {/* Thumbnail */}
      <a
        href={rec.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full aspect-video bg-zinc-800 overflow-hidden"
      >
        {rec.thumbnail_url ? (
          <Image
            src={rec.thumbnail_url}
            alt={rec.title}
            fill
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
      <div className="flex flex-col gap-5 p-7 flex-1">
        {/* Category badge */}
        <span
          className={`self-start px-2 py-0.5 rounded-full text-xs border font-medium ${catColor}`}
        >
          {catLabel}
        </span>

        {/* Title */}
        <a
          href={rec.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-1 text-zinc-100 font-semibold text-xl leading-snug hover:text-white"
        >
          <span>{rec.title}</span>
          <ExternalLink
            size={13}
            className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
          />
        </a>

        {/* Description */}
        {rec.description && (
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
          <LikeButton id={rec.id} likesCount={rec.likes_count} />
        </div>
      </div>
    </div>
  );
}
