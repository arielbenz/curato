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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-scale-in">
      <div className="w-full max-w-sm glass-modal border border-zinc-700/50 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 animate-fade-in-up">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-zinc-100 font-black text-2xl tracking-tight" style={{ letterSpacing: '-0.02em' }}>¿Quién sos?</h2>
          <p className="text-zinc-500 text-sm font-medium">
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
                className={`ripple w-full py-3.5 rounded-xl border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700 hover:border-zinc-600 hover:scale-105 active:scale-95 transition-all font-bold text-lg shadow-lg hover:shadow-xl ${color}`}>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
