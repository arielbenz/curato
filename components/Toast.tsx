"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onDismiss,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl text-sm font-semibold backdrop-blur-xl ${
          type === "success"
            ? "glass-modal border-zinc-700/50 text-zinc-100"
            : "glass-modal border-rose-500/50 text-rose-300"
        }`}
      >
        {type === "success" ? (
          <CheckCircle size={18} strokeWidth={2.5} className="text-green-400 shrink-0 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
        ) : (
          <XCircle size={18} strokeWidth={2.5} className="text-rose-400 shrink-0 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
        )}
        {message}
      </div>
    </div>
  );
}
