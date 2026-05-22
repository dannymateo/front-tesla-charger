"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@nextui-org/react";
import { TeslaLogo } from "@/components/brand/TeslaLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, getRoleHomePath } from "@/lib/constants";
import { markSessionEntry } from "@/lib/session-entry";
import type { PublicUser, UserRole } from "@/lib/types";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("driver@tesla.local");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Error al iniciar sesión");
      }

      const user = data.user as PublicUser;
      const role = (data.role ?? user.role) as UserRole;
      const redirect = searchParams.get("redirect");
      const home = getRoleHomePath(role);
      const rolePrefix = role === "ADMIN" ? "/admin" : "/driver";

      markSessionEntry();
      router.push(
        redirect && redirect.startsWith(rolePrefix) ? redirect : home,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <TeslaLogo className="mx-auto h-7 w-44 sm:h-8 sm:w-52" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
            Bienvenido
          </h1>
          <p className="mt-2 text-neutral-500">
            Inicia sesión para acceder a la red Supercharger
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Correo electrónico"
              value={email}
              onValueChange={setEmail}
              variant="bordered"
              isRequired
              classNames={{ input: "text-white" }}
            />
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onValueChange={setPassword}
              variant="bordered"
              isRequired
              classNames={{ input: "text-white" }}
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
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-500">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-tesla-red hover:underline">
              Regístrate
            </Link>
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Cuentas demo
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-left text-sm transition hover:bg-white/10"
              >
                <span className="text-neutral-300">{acc.email}</span>
                <span className="text-xs text-neutral-500">{acc.role}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
