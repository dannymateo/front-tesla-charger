"use client";

import { Button, Progress } from "@nextui-org/react";
import { Bolt, Clock, DollarSign, StopCircle } from "lucide-react";
import type { SessionProgressEvent, SessionView } from "@/lib/types";
import { formatDuration, formatKwh, formatUsd } from "@/lib/utils";
import { GlassCard, MetricCard } from "@/components/ui/GlassCard";

type ChargingSessionViewProps = {
  session: SessionView | null;
  progress: SessionProgressEvent | null;
  stopping: boolean;
  onStop: () => void;
};

export function ChargingSessionView({
  session,
  progress,
  stopping,
  onStop,
}: ChargingSessionViewProps) {
  const percent = progress?.percentComplete ?? session?.percentComplete ?? 0;
  const delivered = progress?.deliveredKwh ?? session?.deliveredKwh ?? 0;
  const cost = progress?.accumulatedCost ?? session?.accumulatedCost ?? 0;
  const remaining = progress?.remainingSec ?? 0;
  const requested = session?.requestedKwh ?? 0;
  const isActive = session?.status === "IN_PROGRESS";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="text-center">
        <p className="tesla-subheading mb-2">Sesión activa</p>
        <h1 className="tesla-heading">Cargando en Supercharger</h1>
      </div>

      <GlassCard className="relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-tesla-red/5 to-transparent" />
        <div className="relative flex flex-col items-center">
          <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#E82127"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${percent * 2.64} 264`}
                className="transition-all duration-500"
                style={{ filter: "drop-shadow(0 0 8px rgba(232,33,39,0.5))" }}
              />
            </svg>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{percent}%</p>
              <p className="text-xs text-neutral-500">completado</p>
            </div>
          </div>

          <Progress
            value={percent}
            color="danger"
            className="mb-4 max-w-md"
            aria-label="Progreso de carga"
          />

          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Entregado" value={formatKwh(delivered)} />
            <MetricCard label="Solicitado" value={formatKwh(requested)} />
            <MetricCard
              label="Costo"
              value={formatUsd(cost)}
              accent="#E82127"
            />
            <MetricCard
              label="Restante"
              value={isActive ? formatDuration(remaining) : "—"}
            />
          </div>
        </div>
      </GlassCard>

      {isActive && (
        <Button
          color="danger"
          variant="bordered"
          size="lg"
          className="w-full border-tesla-red/50 font-semibold"
          startContent={<StopCircle className="h-5 w-5" />}
          isLoading={stopping}
          onPress={onStop}
        >
          Detener carga
        </Button>
      )}

      {!isActive && session && (
        <GlassCard className="text-center">
          <Bolt className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p className="font-semibold text-white">Sesión finalizada</p>
          <p className="mt-1 text-sm text-neutral-500">
            Total: {formatKwh(delivered)} · {formatUsd(cost)}
          </p>
        </GlassCard>
      )}

      <div className="flex justify-center gap-6 text-neutral-500">
        <span className="flex items-center gap-1 text-xs">
          <DollarSign className="h-3 w-3" /> Facturación automática
        </span>
        <span className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" /> Tiempo real vía WebSocket
        </span>
      </div>
    </div>
  );
}
