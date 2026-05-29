"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminAlertProps = {
  type: "error" | "success" | "warning";
  message: string;
  onDismiss?: () => void;
  className?: string;
};

const styles = {
  error: "border-red-500/30 bg-red-500/10 text-red-300",
  success: "border-green-500/30 bg-green-500/10 text-green-300",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
};

export function AdminAlert({ type, message, onDismiss, className }: AdminAlertProps) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        styles[type],
        className,
      )}
      role="alert"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
