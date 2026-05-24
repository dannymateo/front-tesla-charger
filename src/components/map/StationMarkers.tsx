"use client";

import { useMemo, useRef } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { StationWithState } from "@/lib/types";
import { createStationMarkerIcon } from "./map-marker-icons";

type StationMarkersProps = {
  stations: StationWithState[];
  selectedId?: string | null;
  onSelect: (station: StationWithState) => void;
};

export function StationMarkers({ stations, selectedId, onSelect }: StationMarkersProps) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const iconsByState = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    return (state: string, selected: boolean) => {
      const key = `${state}-${selected}`;
      if (!cache.has(key)) {
        cache.set(key, createStationMarkerIcon(state, selected));
      }
      return cache.get(key)!;
    };
  }, []);

  return (
    <>
      {stations.map((station) => {
        const state =
          station.state ?? (station.enabled === false ? "DISABLED" : "AVAILABLE");
        const selected = station.id === selectedId;

        return (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={iconsByState(state, selected)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event.originalEvent);
                onSelectRef.current(station);
              },
            }}
          />
        );
      })}
    </>
  );
}
