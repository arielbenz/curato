export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      // /shorts/ID or /embed/ID
      const match = parsed.pathname.match(
        /\/(shorts|embed|v)\/([a-zA-Z0-9_-]{11})/,
      );
      if (match) return match[2];
    }
    if (parsed.hostname === "youtu.be" || parsed.hostname === "www.youtu.be") {
      const id = parsed.pathname.slice(1).split("?")[0];
      if (id.length === 11) return id;
    }
  } catch {
    // invalid URL
  }
  return null;
}

export async function getThumbnail(url: string): Promise<string | null> {
  // YouTube fast path
  const ytId = getYouTubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  // Generic: try to fetch og:image from the page
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CuratoBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );
    if (match?.[1]) return match[1];
  } catch {
    // network error or timeout → no thumbnail
  }
  return null;
}
