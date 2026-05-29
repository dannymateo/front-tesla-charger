"use client";

import { useCallback, useState } from "react";
import { formatAdminStationError } from "@/lib/api-error";
import { toggleStationEnabled } from "@/lib/admin-station-api";
import { canDisableStation } from "@/lib/station-usage";
import type { StationWithState } from "@/lib/types";

type StationWithUsage = StationWithState & { activeSessions?: unknown[] };

export function useAdminStationToggle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<{
    station: StationWithUsage;
    onDone?: () => void;
  } | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const executeToggle = useCallback(
    async (station: StationWithUsage, enabled: boolean, onDone?: () => void) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await toggleStationEnabled(station.id, enabled);
        setSuccess(
          enabled
            ? `${station.name} habilitada correctamente`
            : `${station.name} deshabilitada correctamente`,
        );
        onDone?.();
      } catch (err) {
        setError(formatAdminStationError(err));
      } finally {
        setLoading(false);
        setConfirmDisable(null);
      }
    },
    [],
  );

  const requestToggle = useCallback(
    (station: StationWithUsage, enabled: boolean, onDone?: () => void) => {
      setError(null);
      setSuccess(null);

      if (!enabled) {
        const { allowed, activeCount } = canDisableStation(station);
        if (!allowed) {
          setError(
            `Hay ${activeCount} sesión(es) o conector(es) en uso. No puedes deshabilitar la estación hasta que finalicen.`,
          );
          return;
        }

        setConfirmDisable({ station, onDone });
        return;
      }

      void executeToggle(station, true, onDone);
    },
    [executeToggle],
  );

  const confirmDisableAction = useCallback(() => {
    if (!confirmDisable) return;
    void executeToggle(confirmDisable.station, false, confirmDisable.onDone);
  }, [confirmDisable, executeToggle]);

  const cancelDisable = useCallback(() => {
    if (!loading) setConfirmDisable(null);
  }, [loading]);

  return {
    loading,
    error,
    success,
    confirmDisable,
    requestToggle,
    confirmDisableAction,
    cancelDisable,
    clearMessages,
    setError,
  };
}
