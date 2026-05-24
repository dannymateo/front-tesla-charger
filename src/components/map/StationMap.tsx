"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { MEDELLIN_CENTER } from "@/lib/constants";
import type { StationWithState } from "@/lib/types";
import { StationMarkers } from "./StationMarkers";
import { MapBackgroundDismiss, StationMapTooltipAnchor } from "./StationMapTooltipAnchor";

type StationMapProps = {
  stations: StationWithState[];
  selectedId?: string | null;
  onSelect: (station: StationWithState) => void;
  center?: [number, number];
  zoom?: number;
  showDisabled?: boolean;
  tooltip?: React.ReactNode;
  tooltipPosition?: { lat: number; lng: number } | null;
  onDismissTooltip?: () => void;
};

export default function StationMap({
  stations,
  selectedId,
  onSelect,
  center,
  zoom = 13,
  showDisabled = false,
  tooltip,
  tooltipPosition,
  onDismissTooltip,
}: StationMapProps) {
  const initialCenter = useMemo<[number, number]>(() => {
    if (center) return center;
    if (stations.length > 0) {
      return [Number(stations[0].lat), Number(stations[0].lng)];
    }
    return [MEDELLIN_CENTER.lat, MEDELLIN_CENTER.lng];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const visibleStations = showDisabled
    ? stations
    : stations.filter((s) => s.enabled !== false);

  const showTooltip = Boolean(tooltip && tooltipPosition);

  return (
    <MapContainer
      center={initialCenter}
      zoom={zoom}
      className="h-full w-full overflow-hidden"
      zoomControl={false}
      style={{ background: "#0a0a0a" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <StationMarkers
        stations={visibleStations}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      {showTooltip && tooltipPosition && (
        <>
          {onDismissTooltip && <MapBackgroundDismiss onDismiss={onDismissTooltip} />}
          <StationMapTooltipAnchor lat={tooltipPosition.lat} lng={tooltipPosition.lng}>
            {tooltip}
          </StationMapTooltipAnchor>
        </>
      )}
    </MapContainer>
  );
}
