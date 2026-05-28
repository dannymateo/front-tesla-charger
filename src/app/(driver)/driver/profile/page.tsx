"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { AlertTriangle, Car } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { clientApi } from "@/lib/client-api";
import { getErrorMessage } from "@/lib/api-error";
import { ServiceUnavailableBanner } from "@/components/ui/ServiceUnavailableBanner";
import type { Invoice, PublicUser } from "@/lib/types";
import { formatKwh } from "@/lib/utils";
import Link from "next/link";

export default function DriverProfilePage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [saving, setSaving] = useState(false);
  const [vehicleModel, setVehicleModel] = useState("");
  const [batteryKwh, setBatteryKwh] = useState("");
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const profile = await clientApi<PublicUser>("/me");
        setUser(profile);
        setVehicleModel(profile.vehicleModel);
        setBatteryKwh(String(profile.batteryKwh));
      } catch (e) {
        setProfileError(getErrorMessage(e));
      }

      try {
        const inv = await clientApi<Invoice[]>("/me/invoices");
        setInvoices(inv);
      } catch (e) {
        setInvoicesError(getErrorMessage(e));
      }
    })();
  }, []);

  const pending = invoices.filter((i) => i.status === "PENDING").length;
  const overdue = invoices.filter((i) => i.status === "OVERDUE").length;
  const paid = invoices.filter((i) => i.status === "PAID").length;

  async function saveProfile() {
    setSaving(true);
    setProfileError(null);
    try {
      const updated = await clientApi<PublicUser>("/me", {
        method: "PATCH",
        body: {
          vehicleModel,
          batteryKwh: Number(batteryKwh),
        },
      });
      setUser(updated);
    } catch (e) {
      setProfileError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <p className="tesla-subheading mb-1">Tu cuenta</p>
        <h1 className="tesla-heading">Perfil</h1>
      </div>

      {profileError && (
        <ServiceUnavailableBanner message={profileError} />
      )}

      {user?.isBlocked && (
        <GlassCard className="flex items-start gap-3 border-red-500/30 bg-red-500/5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-400">Cuenta bloqueada</p>
            <p className="mt-1 text-sm text-neutral-400">
              Tienes facturas vencidas de más de 30 días. Paga para reactivar la carga.
            </p>
            <Button as={Link} href="/driver/billing" color="danger" size="sm" className="mt-3">
              Ver facturas
            </Button>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <Car className="h-6 w-6 text-neutral-400" />
          </div>
          <div>
            <p className="font-medium text-white">{user?.email}</p>
            <p className="text-sm text-neutral-500">Conductor Tesla</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Modelo del vehículo"
            value={vehicleModel}
            onValueChange={setVehicleModel}
            variant="bordered"
          />
          <Input
            label="Capacidad batería (kWh)"
            value={batteryKwh}
            onValueChange={setBatteryKwh}
            variant="bordered"
          />
          <Button color="danger" isLoading={saving} onPress={saveProfile}>
            Guardar cambios
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="tesla-subheading mb-4">Estado de cuenta</p>
        {invoicesError ? (
          <ServiceUnavailableBanner message={invoicesError} className="mb-4" />
        ) : (
          <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-yellow-500/10 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pending}</p>
            <p className="text-xs text-neutral-500">Pendientes</p>
          </div>
          <div className="rounded-xl bg-red-500/10 p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{overdue}</p>
            <p className="text-xs text-neutral-500">Vencidas</p>
          </div>
          <div className="rounded-xl bg-green-500/10 p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{paid}</p>
            <p className="text-xs text-neutral-500">Pagadas</p>
          </div>
          </div>
        )}
        {user && !invoicesError && (
          <p className="mt-4 text-sm text-neutral-500">
            Batería registrada: {formatKwh(user.batteryKwh)}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
