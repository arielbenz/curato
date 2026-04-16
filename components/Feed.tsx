"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus, Clapperboard, LayoutGrid, List } from "lucide-react";
import type { Recommendation, Reaction, Comment, Watched } from "@/lib/db";
import type { Friend } from "@/lib/constants";
import { STORAGE_NAME_KEY, FRIENDS, FRIEND_COLORS } from "@/lib/constants";
import RecommendationCard from "@/components/RecommendationCard";
import CategoryFilter from "@/components/CategoryFilter";
import PlatformFilter from "@/components/PlatformFilter";
import Leaderboard from "@/components/Leaderboard";
import AddRecommendationForm from "@/components/AddRecommendationForm";
import UserPickerModal from "@/components/UserPickerModal";
import Toast from "@/components/Toast";
import { detectPlatform, type Platform } from "@/lib/platforms";

interface FeedProps {
  recommendations: Recommendation[];
  reactionsMap: Record<number, Reaction[]>;
  commentsMap: Record<number, Comment[]>;
  watchedMap: Record<number, Watched[]>;
}
const ADD_MESSAGES = [
  (name: string) => `¡Alta recomendación, ${name}! 🔥`,
  (name: string) => `Qué groso/a sos, ${name} 👏`,
  (name: string) => `${name} sabe lo que hace 🎯`,
  (name: string) => `Eso, ${name}, traé más de esas 💪`,
  (name: string) => `${name} con todo, gracias! ✨`,
  (name: string) => `Clase ${name}, pura clase 🎬`,
];

const DELETE_MESSAGES = [
  (name: string) => `${name} se arrepintió... era una cagada igual 😂`,
  (name: string) => `Borrado. ${name} borra sus huellas 🕵️`,
  (name: string) => `${name} cambió de opinión, está bien jaja`,
  (name: string) => `Eliminado. ${name} lo sabe todo 🧹`,
];

function randomMessage(arr: ((name: string) => string)[], name: string) {
  return arr[Math.floor(Math.random() * arr.length)](name);
}

export default function Feed({ recommendations, reactionsMap, commentsMap, watchedMap }: FeedProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [currentUser, setCurrentUser] = useState<Friend | null>(null);
  const [listMode, setListMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // isMounted: false en servidor y primer render cliente (para evitar hydration mismatch)
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const savedUser = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem(STORAGE_NAME_KEY),
    () => null,
  );
  const resolvedUser: Friend | null = isMounted
    ? (currentUser ??
      (savedUser && FRIENDS.includes(savedUser as Friend)
        ? (savedUser as Friend)
        : null))
    : null;

  const categoryFiltered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === filter);

  const platformCounts = categoryFiltered.reduce<Record<string, number>>(
    (acc, r) => {
      const p = detectPlatform(r.url);
      acc[p] = (acc[p] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const presentPlatforms = (Object.keys(platformCounts) as Platform[]).sort(
    (a, b) => (platformCounts[b] ?? 0) - (platformCounts[a] ?? 0),
  );

  const filtered =
    platformFilter === "all"
      ? categoryFiltered
      : categoryFiltered.filter(
          (r) => detectPlatform(r.url) === platformFilter,
        );

  const counts = recommendations.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1;
    return acc;
  }, {});

  const userColor = resolvedUser
    ? (FRIEND_COLORS[resolvedUser] ?? "text-zinc-300")
    : "text-zinc-300";

  return (
    <>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Picker de usuario (primera vez) */}
      {isMounted && !resolvedUser && (
        <UserPickerModal
          onSelect={(name) => {
            localStorage.setItem(STORAGE_NAME_KEY, name);
            setCurrentUser(name);
          }}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 p-1.5 sm:p-2 bg-linear-to-br from-orange-500 to-pink-600 rounded-xl shadow-lg glow-orange">
              <Clapperboard size={18} className="text-white sm:hidden" />
              <Clapperboard size={22} className="text-white hidden sm:block" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-black text-zinc-100 text-xl sm:text-3xl tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                Curato
              </span>
              <span className="hidden sm:block text-sm text-zinc-500 tracking-wide font-medium">
                recomendaciones de elonistas sin 🦵
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {resolvedUser && (
              <span
                className={`hidden sm:block text-base font-bold ${userColor}`}>
                {resolvedUser}
              </span>
            )}
            <div className="flex items-center gap-1 border border-zinc-700/50 bg-zinc-900/50 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setListMode(false)}
                className={`p-1.5 sm:p-2 rounded transition-all ${!listMode ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
                aria-label="Vista grilla">
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setListMode(true)}
                className={`p-1.5 sm:p-2 rounded transition-all ${listMode ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}
                aria-label="Vista lista">
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="ripple flex items-center gap-1.5 bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
              <Plus size={16} strokeWidth={3} />
              <span className="hidden xs:inline sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8 flex-1">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Filtros de categoría */}
          <CategoryFilter
            selected={filter}
            onChange={(cat) => {
              setFilter(cat);
              setPlatformFilter("all");
            }}
            counts={counts}
            total={recommendations.length}
          />

          {/* Filtros de plataforma */}
          <PlatformFilter
            platforms={presentPlatforms}
            selected={platformFilter}
            onChange={setPlatformFilter}
            counts={platformCounts}
            total={categoryFiltered.length}
          />

          {/* Grid + Podio */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-3 flex-1">
                <Clapperboard size={40} className="text-zinc-700" />
                <p className="text-zinc-500 text-sm">
                  {recommendations.length === 0
                    ? "Todavía no hay recomendaciones. ¡Sé el primero!"
                    : "No hay recomendaciones con estos filtros."}
                </p>
              </div>
            ) : (
              <div
                className={
                  listMode
                    ? "flex flex-col gap-3 flex-1"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 flex-1"
                }>
                {filtered.map((rec, i) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    reactions={reactionsMap[rec.id] || []}
                    comments={commentsMap[rec.id] || []}
                    watched={watchedMap[rec.id] || []}
                    priority={i < 3}
                    currentUser={resolvedUser}
                    listMode={listMode}
                    staggerIndex={i % 6}
                    onDeleted={() =>
                      setToast(
                        randomMessage(DELETE_MESSAGES, resolvedUser ?? "vos"),
                      )
                    }
                  />
                ))}
              </div>
            )}

            {/* Sidebar: podio (solo desktop) */}
            <aside className="hidden lg:block w-56 shrink-0">
              <Leaderboard recommendations={recommendations} />
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-600 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-linear-to-br from-orange-500 to-pink-600 rounded-md">
              <Clapperboard size={11} className="text-white" />
            </div>
            <span className="font-semibold text-zinc-500">Curato</span>
            <span>·</span>
            <span>recomendaciones de elonistas sin 🦵</span>
          </div>
          <span>Ariel, Mauro &amp; Fernando · {new Date().getFullYear()}</span>
        </div>
      </footer>

      {/* Modal agregar */}
      {open && resolvedUser && (
        <AddRecommendationForm
          currentUser={resolvedUser}
          onClose={() => setOpen(false)}
          onAdded={() =>
            setToast(randomMessage(ADD_MESSAGES, resolvedUser ?? "vos"))
          }
        />
      )}
    </>
  );
}
