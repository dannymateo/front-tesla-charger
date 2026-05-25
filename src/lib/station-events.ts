import type { AdminMapStation, StationStateEvent, StationWithState } from "./types";

function eventPatch(event: StationStateEvent) {
  return {
    state: event.state,
    enabled: event.enabled,
    activeKw: event.activeKw,
    busyConnectors: event.busyConnectors,
    freeConnectors: event.freeConnectors,
    connectorsTotal: event.connectorsTotal,
    maxKwThreshold: event.maxKwThreshold,
    pricePerKwh: event.pricePerKwh,
    ...(event.name !== undefined ? { name: event.name } : {}),
    ...(event.address !== undefined ? { address: event.address } : {}),
    ...(event.lat !== undefined ? { lat: event.lat } : {}),
    ...(event.lng !== undefined ? { lng: event.lng } : {}),
  };
}

function canAddFromEvent(event: StationStateEvent): boolean {
  return (
    event.enabled !== false &&
    Boolean(event.name) &&
    event.lat !== undefined &&
    event.lng !== undefined
  );
}

/** Mapa conductor: quita estaciones deshabilitadas o eliminadas. */
export function applyDriverStationEvent(
  stations: StationWithState[],
  event: StationStateEvent,
): StationWithState[] {
  const id = event.stationId;

  if (event.deleted || event.enabled === false) {
    return stations.filter((s) => s.id !== id);
  }

  const patch = eventPatch(event);
  const index = stations.findIndex((s) => s.id === id);

  if (index >= 0) {
    return stations.map((s) =>
      s.id === id ? { ...s, ...patch, id } : s,
    );
  }

  if (!canAddFromEvent(event)) {
    return stations;
  }

  return [
    ...stations,
    {
      id,
      name: event.name!,
      address: event.address ?? "",
      lat: event.lat!,
      lng: event.lng!,
      ...patch,
    },
  ];
}

/** Mapa admin: mantiene estaciones deshabilitadas con estado actualizado. */
export function applyAdminStationEvent(
  stations: AdminMapStation[],
  event: StationStateEvent,
): AdminMapStation[] {
  const id = event.stationId;

  if (event.deleted) {
    return stations.filter((s) => s.id !== id);
  }

  const patch = eventPatch(event);
  const index = stations.findIndex((s) => s.id === id);

  if (index >= 0) {
    return stations.map((s) =>
      s.id === id
        ? {
            ...s,
            ...patch,
            id,
            activeSessions: event.activeSessions ?? s.activeSessions,
            revenueToday: event.revenueToday ?? s.revenueToday,
          }
        : s,
    );
  }

  if (!canAddFromEvent(event)) {
    return stations;
  }

  return [
    ...stations,
    {
      id,
      name: event.name!,
      address: event.address ?? "",
      lat: event.lat!,
      lng: event.lng!,
      activeSessions: event.activeSessions ?? [],
      revenueToday: event.revenueToday ?? { total: 0, paidInvoicesCount: 0 },
      ...patch,
    },
  ];
}

export function patchSelectedStation<T extends StationWithState>(
  selected: T | null,
  event: StationStateEvent,
): T | null {
  if (!selected || selected.id !== event.stationId) {
    return selected;
  }

  if (event.deleted) {
    return null;
  }

  return { ...selected, ...eventPatch(event), id: event.stationId };
}
