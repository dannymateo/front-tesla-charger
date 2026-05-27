"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@nextui-org/react";
import { ArrowLeft, CircleAlert, RotateCcw } from "lucide-react";
import { TeslaLogo } from "@/components/brand/TeslaLogo";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const cancelledToken = useMemo(() => searchParams.get("token"), [searchParams]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-tesla-gradient" />
      <GlassCard className="relative w-full max-w-xl border border-white/10 p-6 text-center sm:p-8">
        <TeslaLogo className="mx-auto mb-7 h-7 w-44 sm:h-8 sm:w-52" />
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10">
          <CircleAlert className="h-10 w-10 text-amber-300" />
        </div>

        <p className="tesla-subheading">PayPal sin confirmar</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pago cancelado
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-400 sm:text-base">
          No se realizo ningun cobro. Puedes regresar al modulo de facturacion y
          volver a intentar el pago cuando quieras.
        </p>

        {cancelledToken && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              Referencia de intento
            </p>
            <p className="mt-1 break-all text-xs text-neutral-300 sm:text-sm">
              <span className="text-neutral-500">Token:</span> {cancelledToken}
            </p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            as={Link}
            href="/driver/billing"
            color="danger"
            className="font-semibold"
            startContent={<RotateCcw className="h-4 w-4" />}
          >
            Reintentar pago
          </Button>
          <Button as={Link} href="/driver/map" variant="flat" className="font-medium">
            Ir al mapa
          </Button>
        </div>

        <Button
          as={Link}
          href="/driver/billing"
          variant="light"
          startContent={<ArrowLeft className="h-4 w-4" />}
          className="mt-3 text-neutral-400"
        >
          Volver a facturacion
        </Button>
      </GlassCard>
    </div>
  );
}
