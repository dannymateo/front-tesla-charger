"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { clientApi } from "@/lib/client-api";
import type { SessionView } from "@/lib/types";

export default function ActiveChargingPage() {
  const router = useRouter();
  const [active, setActive] = useState<SessionView | null>(null);

  useEffect(() => {
    clientApi<SessionView[]>("/me/sessions")
      .then((sessions) => {
        const inProgress = sessions.find((s) => s.status === "IN_PROGRESS");
        setActive(inProgress ?? null);
        if (inProgress) {
          router.replace(`/driver/charging/${inProgress.id}`);
        }
      })
      .catch(() => setActive(null));
  }, [router]);

  if (active) return null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <p className="tesla-subheading mb-2">Sin carga activa</p>
      <h1 className="tesla-heading mb-4">Listo para cargar</h1>
      <p className="mb-6 max-w-md text-neutral-500">
        Selecciona una estación en el mapa para iniciar tu sesión de carga.
      </p>
      <Button color="danger" onPress={() => router.push("/driver/map")}>
        Ir al mapa
      </Button>
    </div>
  );
}
