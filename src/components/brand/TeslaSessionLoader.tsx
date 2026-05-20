"use client";

import { TeslaWordmark } from "@/components/brand/TeslaLogo";
import { cn } from "@/lib/utils";

type TeslaSessionLoaderProps = {
  exiting?: boolean;
};

export function TeslaSessionLoader({ exiting = false }: TeslaSessionLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-[600ms] ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <div className="pointer-events-none absolute inset-0 bg-tesla-gradient" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,33,39,0.08),transparent_55%)]" />

      <div className="relative flex flex-col items-center px-6">
        <div className="tesla-loader-logo mx-auto h-10 w-56 text-white sm:h-12 sm:w-64">
          <TeslaWordmark />
        </div>

        <div className="mt-10 w-48 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <div className="tesla-loader-bar h-0.5 rounded-full bg-gradient-to-r from-tesla-red via-red-400 to-tesla-red" />
        </div>

        <p className="tesla-loader-status mt-6 text-xs text-neutral-600">
          Preparando tu experiencia de carga…
        </p>
      </div>
    </div>
  );
}
