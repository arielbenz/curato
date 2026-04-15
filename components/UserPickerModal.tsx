"use client";

import {
  FRIENDS,
  STORAGE_NAME_KEY,
  FRIEND_COLORS,
  type Friend,
} from "@/lib/constants";

interface UserPickerModalProps {
  onSelect: (name: Friend) => void;
}

export default function UserPickerModal({ onSelect }: UserPickerModalProps) {
  function handleSelect(name: Friend) {
    localStorage.setItem(STORAGE_NAME_KEY, name);
    onSelect(name);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-zinc-100 font-bold text-xl">¿Quién sos?</h2>
          <p className="text-zinc-500 text-sm">
            Elegí tu nombre para continuar
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FRIENDS.map((name) => {
            const color = FRIEND_COLORS[name] ?? "text-zinc-300";
            return (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className={`w-full py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 transition-colors font-semibold text-base ${color}`}>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
