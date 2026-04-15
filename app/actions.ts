"use server";

import { revalidatePath } from "next/cache";
import {
  addRecommendation,
  incrementLikes,
  decrementLikes,
  deleteRecommendation,
} from "@/lib/db";
import { getThumbnail } from "@/lib/thumbnails";
import { FRIENDS, CATEGORIES } from "@/lib/constants";

export async function addRecommendationAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const title = (formData.get("title") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const category = formData.get("category") as string;
  const recommended_by = formData.get("recommended_by") as string;

  if (!title) return { error: "El título es obligatorio." };
  if (!url) return { error: "La URL es obligatoria." };
  if (!CATEGORIES.find((c) => c.value === category))
    return { error: "Categoría inválida." };
  if (!FRIENDS.includes(recommended_by as (typeof FRIENDS)[number]))
    return { error: "Nombre inválido." };

  try {
    new URL(url);
  } catch {
    return { error: "La URL no es válida." };
  }

  let thumbUrl: string | null = null;
  try {
    thumbUrl = await getThumbnail(url);
  } catch {
    // thumbnail optional — continue without it
  }

  await addRecommendation({
    title,
    url,
    description,
    category,
    recommended_by,
    thumbnail_url: thumbUrl,
  });

  revalidatePath("/");
  return {};
}

export async function likeAction(id: number): Promise<void> {
  await incrementLikes(id);
  revalidatePath("/");
}

export async function unlikeAction(id: number): Promise<void> {
  await decrementLikes(id);
  revalidatePath("/");
}

export async function deleteAction(
  id: number,
  recommended_by: string,
): Promise<{ error?: string }> {
  if (!FRIENDS.includes(recommended_by as (typeof FRIENDS)[number]))
    return { error: "Nombre inválido." };
  await deleteRecommendation(id, recommended_by);
  revalidatePath("/");
  return {};
}

export async function fetchUrlMetadata(
  url: string,
): Promise<{ title: string | null; description: string | null }> {
  try {
    new URL(url);
  } catch {
    return { title: null, description: null };
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CuratoBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { title: null, description: null };
    const html = await res.text();

    const ogTitle =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      )?.[1];

    const tagTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

    const ogDesc =
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      )?.[1] ||
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
      )?.[1];

    const title = (ogTitle || tagTitle)?.trim().slice(0, 200) ?? null;
    const description = ogDesc?.trim().slice(0, 500) ?? null;

    return { title, description };
  } catch {
    return { title: null, description: null };
  }
}
