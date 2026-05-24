"use client";

import dynamic from "next/dynamic";
import type { StationWithState } from "@/lib/types";

const StationMapInner = dynamic(() => import("./StationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 items-center justify-center bg-neutral-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-tesla-red border-t-transparent" />
        <p className="text-sm text-neutral-500">Cargando mapa...</p>
      </div>
    </div>
  ),
});

export function StationMapClient(props: {
  stations: StationWithState[];
  selectedId?: string | null;
  onSelect: (station: StationWithState) => void;
  center?: [number, number];
  zoom?: number;
  showDisabled?: boolean;
  tooltip?: React.ReactNode;
  tooltipPosition?: { lat: number; lng: number } | null;
  onDismissTooltip?: () => void;
}) {
  return <StationMapInner {...props} />;
}
