"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@nextui-org/react";
import { cn } from "@/lib/utils";

type ServiceUnavailableBannerProps = {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
};

export function ServiceUnavailableBanner({
  message,
  onRetry,
  retrying = false,
  className,
}: ServiceUnavailableBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center",
        className,
      )}
      role="alert"
    >
      <div className="flex flex-1 items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-medium text-amber-200">
            Servicio no disponible
          </p>
          <p className="mt-1 text-sm text-amber-200/80">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="flat"
          color="warning"
          isLoading={retrying}
          onPress={onRetry}
          startContent={!retrying ? <RefreshCw className="h-3.5 w-3.5" /> : undefined}
          className="shrink-0 self-start sm:self-center"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
