import type { AdminMapStation, StationWithState } from "./types";

type StationWithUsage = StationWithState & {
  activeSessions?: unknown[];
};

/** Sesiones o conectores ocupados — indica uso activo de la estación. */
export function getStationActiveUsage(station: StationWithUsage): number {
  const sessions = station.activeSessions?.length ?? 0;
  const busyConnectors = station.busyConnectors ?? 0;
  return Math.max(sessions, busyConnectors);
}

export function canDisableStation(station: StationWithUsage): {
  allowed: boolean;
  activeCount: number;
} {
  const activeCount = getStationActiveUsage(station);
  return { allowed: activeCount === 0, activeCount };
}

export function isAdminMapStation(
  station: StationWithState,
): station is AdminMapStation {
  return "activeSessions" in station && Array.isArray(station.activeSessions);
}
