"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@nextui-org/react";
import { StationMapClient } from "@/components/map/StationMapClient";
import { StationDetailPanel } from "@/components/map/StationDetailPanel";
import { StartSessionModal } from "@/components/charging/StartSessionModal";
import { useMapSocket } from "@/hooks/useSocket";
import { clientApi, clientApiWithCode, extractApiError } from "@/lib/client-api";
import { getErrorMessage } from "@/lib/api-error";
import { applyDriverStationEvent, patchSelectedStation } from "@/lib/station-events";
import { REJECTION_MESSAGES } from "@/lib/constants";
import type {
  PublicUser,
  StartSessionResponse,
  StationStateEvent,
  StationWithState,
} from "@/lib/types";

export default function DriverMapPage() {
  const router = useRouter();
  const [stations, setStations] = useState<StationWithState[]>([]);
  const [selected, setSelected] = useState<StationWithState | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const mergeStationState = useCallback((event: StationStateEvent) => {
    setStations((prev) => applyDriverStationEvent(prev, event));
    setSelected((prev) => {
      const next = patchSelectedStation(prev, event);
      if (next?.enabled === false || event.deleted) {
        return null;
      }
      return next;
    });
  }, []);

  useMapSocket((payload) => mergeStationState(payload as StationStateEvent));

  useEffect(() => {
    async function load() {
      try {
        const [stationsData, profile] = await Promise.all([
          clientApi<StationWithState[]>("/stations"),
          clientApi<PublicUser>("/me"),
        ]);

        const withStates = await Promise.all(
          stationsData.map(async (station) => {
            try {
              const state = await clientApi<StationStateEvent>(
                `/stations/${station.id}/state`,
              );
              return { ...station, ...state, id: station.id };
            } catch {
              return station;
            }
          }),
        );

        setStations(withStates);
        setUser(profile);
      } catch (e) {
        setError(getErrorMessage(e));
      }
    }

    void load();
  }, []);

  async function startSession(kwh: number) {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setModalError(null);

    try {
      const { data, ok } = await clientApiWithCode<
        StartSessionResponse | Record<string, unknown>
      >("/sessions", {
        method: "POST",
        body: { stationId: selected.id, requestedKwh: kwh },
      });

      if (!ok) {
        const err = extractApiError(data);
        const msg =
          (err.code && REJECTION_MESSAGES[err.code]) ||
          err.message ||
          "No se pudo iniciar la sesión";
        setModalError(msg);
        setError(msg);
        return;
      }

      const session = data as StartSessionResponse;
      if (!session.sessionId) {
        const msg = "Respuesta inválida del servidor";
        setModalError(msg);
        setError(msg);
        return;
      }

      setModalOpen(false);
      setSelected(null);
      router.push(`/driver/charging/${session.sessionId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error de conexión";
      setModalError(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function openChargeModal() {
    setModalError(null);
    setError(null);
    setModalOpen(true);
  }

  return (
    <div className="relative h-full w-full max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-14 max-md:z-0">
      <div className="absolute inset-0 z-0">
        <StationMapClient
          stations={stations}
          selectedId={selected?.id}
          onSelect={setSelected}
          tooltipPosition={
            selected && !modalOpen
              ? { lat: selected.lat, lng: selected.lng }
              : null
          }
          onDismissTooltip={() => setSelected(null)}
          tooltip={
            selected && !modalOpen ? (
              <StationDetailPanel
                station={selected}
                onClose={() => setSelected(null)}
                onStartCharge={openChargeModal}
              />
            ) : null
          }
        />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        {user?.isBlocked && (
          <Chip color="danger" variant="flat" className="pointer-events-auto">
            Cuenta bloqueada — paga tus facturas
          </Chip>
        )}
        <Chip variant="flat" className="pointer-events-auto bg-black/60 text-neutral-300">
          {stations.length} estaciones activas
        </Chip>
      </div>

      {error && !modalOpen && (
        <div className="pointer-events-auto absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-950/90 px-4 py-2 text-sm text-red-300">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => setError(null)}>
            Cerrar
          </button>
        </div>
      )}

      <StartSessionModal
        station={selected}
        batteryKwh={user?.batteryKwh ?? 75}
        isOpen={modalOpen}
        loading={loading}
        error={modalError}
        onClose={() => {
          if (!loading) setModalOpen(false);
        }}
        onConfirm={startSession}
      />
    </div>
  );
}
