"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus, Clapperboard, LayoutGrid, List } from "lucide-react";
import type { Recommendation } from "@/lib/db";
import type { Friend } from "@/lib/constants";
import { STORAGE_NAME_KEY, FRIENDS, FRIEND_COLORS } from "@/lib/constants";
import RecommendationCard from "@/components/RecommendationCard";
import CategoryFilter from "@/components/CategoryFilter";
import AddRecommendationForm from "@/components/AddRecommendationForm";
import UserPickerModal from "@/components/UserPickerModal";
import Toast from "@/components/Toast";

interface FeedProps {
  recommendations: Recommendation[];
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

export default function Feed({ recommendations }: FeedProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
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

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === filter);

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
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 p-1.5 sm:p-2 bg-linear-to-br from-orange-500 to-pink-600 rounded-xl shadow-lg shadow-orange-900/30">
              <Clapperboard size={18} className="text-white sm:hidden" />
              <Clapperboard size={22} className="text-white hidden sm:block" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-zinc-100 text-xl sm:text-3xl tracking-tight">
                Curato
              </span>
              <span className="hidden sm:block text-sm text-zinc-500 tracking-wide">
                recomendaciones de elonistas sin 🦵
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {resolvedUser && (
              <span
                className={`hidden sm:block text-base font-medium ${userColor}`}>
                {resolvedUser}
              </span>
            )}
            <div className="flex items-center gap-1 border border-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setListMode(false)}
                className={`p-1.5 sm:p-2 rounded transition-colors ${!listMode ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                aria-label="Vista grilla">
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setListMode(true)}
                className={`p-1.5 sm:p-2 rounded transition-colors ${listMode ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                aria-label="Vista lista">
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-sm sm:text-base transition-colors">
              <Plus size={15} />
              <span className="hidden xs:inline sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8 flex flex-col gap-4 sm:gap-6 flex-1">
        {/* Filters */}
        <CategoryFilter
          selected={filter}
          onChange={setFilter}
          counts={counts}
          total={recommendations.length}
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <Clapperboard size={40} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">
              {filter === "all"
                ? "Todavía no hay recomendaciones. ¡Sé el primero!"
                : "No hay recomendaciones en esta categoría."}
            </p>
          </div>
        ) : (
          <div
            className={
              listMode
                ? "flex flex-col gap-3"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            }>
            {filtered.map((rec, i) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                priority={i < 3}
                currentUser={resolvedUser}
                listMode={listMode}
                onDeleted={() =>
                  setToast(
                    randomMessage(DELETE_MESSAGES, resolvedUser ?? "vos"),
                  )
                }
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-600 text-xs">
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
