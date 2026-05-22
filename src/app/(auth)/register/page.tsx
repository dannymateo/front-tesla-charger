"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@nextui-org/react";
import { TeslaLogo } from "@/components/brand/TeslaLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { DEMO_PASSWORD, getRoleHomePath } from "@/lib/constants";
import { markSessionEntry } from "@/lib/session-entry";
import type { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: DEMO_PASSWORD,
    vehicleModel: "Tesla Model 3",
    batteryKwh: "75",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          batteryKwh: Number(form.batteryKwh),
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 201) {
        throw new Error(data.message ?? "Error al registrarse");
      }

      if (data.role) {
        markSessionEntry();
        router.push(getRoleHomePath(data.role as UserRole));
      } else {
        router.push("/login");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <TeslaLogo className="mx-auto h-7 w-44 sm:h-8 sm:w-52" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Crear cuenta
          </h1>
          <p className="mt-2 text-neutral-500">
            Registra tu Tesla en la red Supercharger de Medellín
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Correo"
              value={form.email}
              onValueChange={(v) => update("email", v)}
              variant="bordered"
              isRequired
            />
            <Input
              type="password"
              label="Contraseña"
              value={form.password}
              onValueChange={(v) => update("password", v)}
              variant="bordered"
              isRequired
            />
            <Input
              label="Modelo del vehículo"
              value={form.vehicleModel}
              onValueChange={(v) => update("vehicleModel", v)}
              variant="bordered"
              isRequired
            />
            <Input
              type="number"
              label="Capacidad batería (kWh)"
              value={form.batteryKwh}
              onValueChange={(v) => update("batteryKwh", v)}
              variant="bordered"
              isRequired
            />

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              color="danger"
              size="lg"
              className="w-full font-semibold"
              isLoading={loading}
            >
              Registrarse
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-tesla-red hover:underline">
              Inicia sesión
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
