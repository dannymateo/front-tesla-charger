import { ApiClientError } from "./api-error";
import { clientApi } from "./client-api";
import type { Station } from "./types";

export type StationPayload = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  connectorsTotal: number;
  maxKwThreshold: number;
  pricePerKwh: number;
};

export async function createStation(data: StationPayload): Promise<Station> {
  return clientApi<Station>("/admin/stations", {
    method: "POST",
    body: data,
  });
}

export async function updateStation(
  stationId: string,
  data: StationPayload,
): Promise<Station> {
  return clientApi<Station>(`/admin/stations/${stationId}`, {
    method: "PATCH",
    body: data,
  });
}

export async function toggleStationEnabled(
  stationId: string,
  enabled: boolean,
): Promise<Station> {
  return clientApi<Station>(`/admin/stations/${stationId}/toggle`, {
    method: "PATCH",
    body: { enabled },
  });
}

export async function deleteStation(stationId: string): Promise<{ ok: boolean }> {
  return clientApi<{ ok: boolean }>(`/admin/stations/${stationId}`, {
    method: "DELETE",
  });
}

export function buildActiveSessionsError(activeCount: number): ApiClientError {
  return new ApiClientError(
    ADMIN_STATION_HAS_ACTIVE_SESSIONS_MESSAGE(activeCount),
    "STATION_HAS_ACTIVE_SESSIONS",
    409,
    { activeSessions: activeCount },
  );
}

function ADMIN_STATION_HAS_ACTIVE_SESSIONS_MESSAGE(activeCount: number): string {
  return `Hay ${activeCount} sesión(es) de carga en curso. Espera a que finalicen antes de deshabilitar.`;
}
