export const STORAGE_NAME_KEY = "curato_name";

export const FRIENDS = ["Ariel", "Mauro", "Fernando"] as const;
export type Friend = (typeof FRIENDS)[number];

export const CATEGORIES = [
  { value: "pelicula", label: "Película" },
  { value: "documental", label: "Documental" },
  { value: "serie", label: "Serie" },
  { value: "otro", label: "Otro" },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_COLORS: Record<string, string> = {
  pelicula: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  documental: "bg-green-500/20 text-green-300 border-green-500/30",
  serie: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  otro: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

export const FRIEND_COLORS: Record<string, string> = {
  Ariel: "text-orange-400",
  Mauro: "text-cyan-400",
  Fernando: "text-pink-400",
};
