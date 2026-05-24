"use client";

import { Button, Chip, Switch } from "@nextui-org/react";
import { MapPin, Pencil, Zap } from "lucide-react";
import type { AdminMapStation, StationWithState } from "@/lib/types";
import { formatUsd } from "@/lib/utils";
import { STATION_STATE_LABELS } from "@/lib/constants";
import { getStationActiveUsage } from "@/lib/station-usage";
import { StatusBadge } from "@/components/ui/StatusBadge";

type StationDetailPanelProps = {
  station: StationWithState;
  onStartCharge: () => void;
  onClose: () => void;
  isAdmin?: boolean;
  onToggle?: (enabled: boolean) => void;
  onEdit?: () => void;
  toggleLoading?: boolean;
  toggleError?: string | null;
  toggleSuccess?: string | null;
};

export function StationDetailPanel({
  station,
  onStartCharge,
  onClose,
  isAdmin = false,
  onToggle,
  onEdit,
  toggleLoading = false,
  toggleError = null,
  toggleSuccess = null,
}: StationDetailPanelProps) {
  const state = station.state ?? (station.enabled === false ? "DISABLED" : "AVAILABLE");
  const canCharge = !isAdmin && state === "AVAILABLE" && station.enabled !== false;
  const activeUsage = isAdmin ? getStationActiveUsage(station) : 0;
  const revenueToday =
    "revenueToday" in station
      ? (station as AdminMapStation).revenueToday
      : undefined;

  return (
    <div className="w-[288px] rounded-xl border border-white/10 bg-neutral-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{station.name}</h3>
          <p className="mt-0.5 flex items-start gap-1 text-xs text-neutral-500">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-2">{station.address}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-0.5 text-neutral-500 hover:bg-white/5 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        <StatusBadge state={state} />
        {isAdmin && (
          <Chip size="sm" variant="flat" color={station.enabled ? "success" : "danger"}>
            {station.enabled ? "On" : "Off"}
          </Chip>
        )}
        {isAdmin && activeUsage > 0 && (
          <Chip size="sm" variant="flat" color="warning">
            {activeUsage} en uso
          </Chip>
        )}
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded-lg bg-white/5 px-2 py-1.5">
          <p className="text-[10px] text-neutral-500">Precio</p>
          <p className="font-semibold text-tesla-red">{formatUsd(station.pricePerKwh)}/kWh</p>
        </div>
        <div className="rounded-lg bg-white/5 px-2 py-1.5">
          <p className="text-[10px] text-neutral-500">Conectores</p>
          <p className="font-semibold">
            {station.freeConnectors ?? "—"}/{station.connectorsTotal}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 px-2 py-1.5">
          <p className="text-[10px] text-neutral-500">Potencia</p>
          <p className="font-semibold">{station.activeKw ?? 0} kW</p>
        </div>
        <div className="rounded-lg bg-white/5 px-2 py-1.5">
          <p className="text-[10px] text-neutral-500">Umbral</p>
          <p className="font-semibold">{station.maxKwThreshold} kW</p>
        </div>
      </div>

      {revenueToday && (
        <p className="mb-2 text-xs text-green-400">
          Hoy: {formatUsd(revenueToday.total)}
        </p>
      )}

      {toggleError && (
        <p className="mb-2 text-xs text-red-400">{toggleError}</p>
      )}
      {toggleSuccess && (
        <p className="mb-2 text-xs text-green-400">{toggleSuccess}</p>
      )}

      {canCharge && (
        <Button
          color="danger"
          size="sm"
          className="w-full font-semibold"
          startContent={<Zap className="h-3.5 w-3.5" />}
          onPress={onStartCharge}
        >
          Iniciar carga
        </Button>
      )}

      {!isAdmin && !canCharge && (
        <p className="rounded-lg bg-yellow-500/10 px-2 py-1.5 text-xs text-yellow-400">
          No disponible ({STATION_STATE_LABELS[state] ?? state})
        </p>
      )}

      {isAdmin && (
        <div className="mt-2 space-y-2 border-t border-white/5 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-400">Servicio</span>
            <Switch
              isSelected={station.enabled}
              isDisabled={toggleLoading}
              color="danger"
              size="sm"
              onValueChange={(enabled) => onToggle?.(enabled)}
            />
          </div>

          {activeUsage > 0 && station.enabled && (
            <p className="text-[11px] text-yellow-500">
              Hay cargas activas — no deshabilitar aún.
            </p>
          )}

          <Button
            size="sm"
            variant="flat"
            className="w-full"
            startContent={<Pencil className="h-3.5 w-3.5" />}
            isDisabled={toggleLoading}
            onPress={onEdit}
          >
            Editar estación
          </Button>
        </div>
      )}
    </div>
  );
}
