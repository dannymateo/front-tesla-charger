"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap, useMapEvents } from "react-leaflet";

type StationMapTooltipAnchorProps = {
  lat: number;
  lng: number;
  children: React.ReactNode;
};

export function StationMapTooltipAnchor({
  lat,
  lng,
  children,
}: StationMapTooltipAnchorProps) {
  const map = useMap();
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(map.getContainer());
  }, [map]);

  useEffect(() => {
    function update() {
      const next = map.latLngToContainerPoint([lat, lng]);
      setPoint({ x: next.x, y: next.y });
    }

    update();
    map.on("move zoom zoomend moveend resize viewreset", update);
    return () => {
      map.off("move zoom zoomend moveend resize viewreset", update);
    };
  }, [map, lat, lng]);

  if (!container) return null;

  return createPortal(
    <div
      className="pointer-events-none absolute z-[1000]"
      style={{ left: point.x, top: point.y }}
    >
      <div className="pointer-events-auto -translate-x-1/2 -translate-y-[calc(100%+14px)]">
        <div
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {children}
        </div>
        <div
          className="absolute left-1/2 top-full -translate-x-1/2 border-[7px] border-transparent border-t-neutral-950/95"
          aria-hidden
        />
      </div>
    </div>,
    container,
  );
}

export function MapBackgroundDismiss({ onDismiss }: { onDismiss: () => void }) {
  useMapEvents({
    click: () => onDismiss(),
  });
  return null;
}
