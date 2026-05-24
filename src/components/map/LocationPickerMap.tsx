"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MEDELLIN_CENTER } from "@/lib/constants";
import { createPickerMarkerIcon } from "./map-marker-icons";

type LocationPickerMapProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
};

function MapClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  lat,
  lng,
  onChange,
  className = "h-64 w-full rounded-xl",
}: LocationPickerMapProps) {
  const position = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  const pickerIcon = useMemo(() => createPickerMarkerIcon(), []);

  const initialCenter = useMemo<[number, number]>(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
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
  }, []);

  return (
    <div className={className}>
      <MapContainer
        center={initialCenter}
        zoom={14}
        className="h-full w-full rounded-xl"
        zoomControl
        style={{ background: "#0a0a0a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onChange={onChange} />
        <Marker
          position={position}
          icon={pickerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const next = marker.getLatLng();
              onChange(next.lat, next.lng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
