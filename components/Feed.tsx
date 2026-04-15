"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus, Tv } from "lucide-react";
import type { Recommendation } from "@/lib/db";
import type { Friend } from "@/lib/constants";
import { STORAGE_NAME_KEY, FRIENDS, FRIEND_COLORS } from "@/lib/constants";
import RecommendationCard from "@/components/RecommendationCard";
import CategoryFilter from "@/components/CategoryFilter";
import AddRecommendationForm from "@/components/AddRecommendationForm";
import UserPickerModal from "@/components/UserPickerModal";

interface FeedProps {
  recommendations: Recommendation[];
}

export default function Feed({ recommendations }: FeedProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<Friend | null>(null);

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
      (savedUser && FRIENDS.includes(savedUser as Friend) ? (savedUser as Friend) : null))
    : null;

  const filtered =
    filter === "all"
      ? recommendations
      : recommendations.filter((r) => r.category === filter);

  const userColor = resolvedUser
    ? (FRIEND_COLORS[resolvedUser] ?? "text-zinc-300")
    : "text-zinc-300";

  return (
    <>
      {/* Picker de usuario (primera vez) */}
      {isMounted && !resolvedUser && (
        <UserPickerModal onSelect={(name) => { localStorage.setItem(STORAGE_NAME_KEY, name); setCurrentUser(name); }} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv size={20} className="text-zinc-400" />
            <span className="font-bold text-zinc-100 text-lg tracking-tight">
              Curato
            </span>
          </div>
          <div className="flex items-center gap-3">
            {resolvedUser && (
              <span className={`text-sm font-medium ${userColor}`}>
                {resolvedUser}
              </span>
            )}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors">
              <Plus size={15} />
              Agregar
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
        {/* Filters */}
        <CategoryFilter selected={filter} onChange={setFilter} />

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <Tv size={40} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">
              {filter === "all"
                ? "Todavía no hay recomendaciones. ¡Sé el primero!"
                : "No hay recomendaciones en esta categoría."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((rec, i) => (
              <RecommendationCard key={rec.id} rec={rec} priority={i < 3} currentUser={resolvedUser} />
            ))}
          </div>
        )}
      </main>

      {/* Modal agregar */}
      {open && resolvedUser && (
        <AddRecommendationForm
          currentUser={resolvedUser}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
