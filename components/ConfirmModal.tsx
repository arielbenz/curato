"use client";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-scale-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}>
      <div className="w-full max-w-sm glass-modal border border-zinc-700/50 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 animate-fade-in-up">
        <p className="text-zinc-100 text-base text-center font-medium">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-all hover:scale-105 active:scale-95">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`ripple flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${
              danger
                ? "bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white"
                : "bg-linear-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white"
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
