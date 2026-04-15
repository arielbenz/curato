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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
          type === "success"
            ? "bg-zinc-900 border-zinc-700 text-zinc-100"
            : "bg-zinc-900 border-rose-500/40 text-rose-300"
        }`}
      >
        {type === "success" ? (
          <CheckCircle size={15} className="text-green-400 shrink-0" />
        ) : (
          <XCircle size={15} className="text-rose-400 shrink-0" />
        )}
        {message}
      </div>
    </div>
  );
}
