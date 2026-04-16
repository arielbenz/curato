export const PLATFORMS = [
  "youtube",
  "netflix",
  "hbo",
  "spotify",
  "prime",
  "twitch",
  "vimeo",
  "other",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_META: Record<Platform, { label: string; color: string; textColor: string }> = {
  youtube: { label: "YouTube",  color: "bg-red-500/20 text-red-400 border-red-500/30",    textColor: "text-red-400"    },
  netflix: { label: "Netflix",  color: "bg-red-700/20 text-red-300 border-red-700/30",    textColor: "text-red-300"    },
  hbo:     { label: "HBO",      color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", textColor: "text-indigo-400" },
  spotify: { label: "Spotify",  color: "bg-green-500/20 text-green-400 border-green-500/30", textColor: "text-green-400"  },
  prime:   { label: "Prime",    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",   textColor: "text-cyan-400"   },
  twitch:  { label: "Twitch",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30", textColor: "text-purple-400" },
  vimeo:   { label: "Vimeo",    color: "bg-sky-500/20 text-sky-400 border-sky-500/30",      textColor: "text-sky-400"    },
  other:   { label: "Web",      color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",   textColor: "text-zinc-400"   },
};

export function detectPlatform(url: string): Platform {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
    if (hostname.includes("netflix.com")) return "netflix";
    if (hostname.includes("hbo.com") || hostname.includes("hbomax.com") || hostname.includes("max.com")) return "hbo";
    if (hostname.includes("spotify.com")) return "spotify";
    if (hostname.includes("primevideo.com") || hostname.includes("amazon.com")) return "prime";
    if (hostname.includes("twitch.tv")) return "twitch";
    if (hostname.includes("vimeo.com")) return "vimeo";
    return "other";
  } catch {
    return "other";
  }
}
