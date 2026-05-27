"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@nextui-org/react";
import { ArrowLeft, CheckCircle2, ReceiptText } from "lucide-react";
import { TeslaLogo } from "@/components/brand/TeslaLogo";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  const paymentToken = useMemo(() => searchParams.get("token"), [searchParams]);
  const payerId = useMemo(() => searchParams.get("PayerID"), [searchParams]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-tesla-gradient" />
      <GlassCard className="relative w-full max-w-xl border border-white/10 p-6 text-center sm:p-8">
        <TeslaLogo className="mx-auto mb-7 h-7 w-44 sm:h-8 sm:w-52" />
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
          <CheckCircle2 className="h-11 w-11 text-emerald-400" />
        </div>

        <p className="tesla-subheading">PayPal confirmado</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pago completado con exito
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-400 sm:text-base">
          Recibimos tu pago correctamente. Si tu cuenta tenia facturas vencidas,
          el desbloqueo se procesa en automatico en los proximos segundos.
        </p>

        {(paymentToken || payerId) && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-neutral-400">
              <ReceiptText className="h-3.5 w-3.5" />
              Referencia de la transaccion
            </p>
            {paymentToken && (
              <p className="text-xs text-neutral-300 sm:text-sm">
                <span className="text-neutral-500">Token:</span> {paymentToken}
              </p>
            )}
            {payerId && (
              <p className="mt-1 text-xs text-neutral-300 sm:text-sm">
                <span className="text-neutral-500">Payer ID:</span> {payerId}
              </p>
            )}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            as={Link}
            href="/driver/billing"
            variant="flat"
            className="font-medium"
          >
            Ver facturas
          </Button>
          <Button as={Link} href="/driver/map" color="danger" className="font-semibold">
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
