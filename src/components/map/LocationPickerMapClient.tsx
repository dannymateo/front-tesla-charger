"use client";

import dynamic from "next/dynamic";

const LocationPickerMapInner = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl bg-neutral-900">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-tesla-red border-t-transparent" />
    </div>
  ),
});

export function LocationPickerMapClient(props: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}) {
  return <LocationPickerMapInner {...props} />;
}
