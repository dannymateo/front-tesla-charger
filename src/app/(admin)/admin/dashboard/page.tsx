"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/GlassCard";
import { clientApi } from "@/lib/client-api";
import { getErrorMessage } from "@/lib/api-error";
import { ServiceUnavailableBanner } from "@/components/ui/ServiceUnavailableBanner";
import type { AdminMapResponse, RevenueToday } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [revenue, setRevenue] = useState<RevenueToday | null>(null);
  const [mapData, setMapData] = useState<AdminMapResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    setRefreshing(true);
    setLoadError(null);
    const errors: string[] = [];

    try {
      const rev = await clientApi<RevenueToday>("/admin/revenue/today");
      setRevenue(rev);
    } catch (e) {
      errors.push(getErrorMessage(e));
    }

    try {
      const map = await clientApi<AdminMapResponse>("/admin/map");
      setMapData(map);
    } catch (e) {
      errors.push(getErrorMessage(e));
    }

    if (errors.length > 0) {
      setLoadError(errors[0]);
    }
    setRefreshing(false);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const stationRevenue = mapData?.stations ?? [];
  const totalStationRevenue = stationRevenue.reduce(
    (sum, s) => sum + (s.revenueToday?.total ?? 0),
    0,
  );
  const activeSessions = stationRevenue.reduce(
    (sum, s) => sum + (s.activeSessions?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="tesla-subheading mb-1">Panel financiero</p>
        <h1 className="tesla-heading">Ingresos del día</h1>
        <p className="mt-2 text-neutral-500">{revenue?.date ?? "Hoy"}</p>
      </div>

      {loadError && (
        <ServiceUnavailableBanner
          message={loadError}
          onRetry={() => void loadDashboard()}
          retrying={refreshing}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Ingresos totales"
          value={formatUsd(revenue?.total ?? 0)}
          sub={`${revenue?.paidInvoicesCount ?? 0} facturas pagadas`}
          accent="#34C759"
        />
        <MetricCard
          label="Sesiones activas"
          value={String(activeSessions)}
          sub="En toda la red"
          accent="#3E6AE1"
        />
        <MetricCard
          label="Estaciones activas"
          value={String(stationRevenue.filter((s) => s.enabled).length)}
          sub={`de ${stationRevenue.length} registradas`}
        />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <TrendingUp className="h-4 w-4 text-tesla-red" />
            Ingresos por estación
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {stationRevenue.map((station) => (
            <div
              key={station.id}
              className="flex items-center justify-between px-5 py-4 transition hover:bg-white/[0.02]"
            >
              <div>
                <p className="font-medium text-white">{station.name}</p>
                <p className="text-xs text-neutral-500">
                  {station.revenueToday?.paidInvoicesCount ?? 0} facturas ·{" "}
                  {station.activeSessions?.length ?? 0} sesiones activas
                </p>
              </div>
              <p className="text-lg font-semibold text-green-400">
                {formatUsd(station.revenueToday?.total ?? 0)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-5 py-4">
          <span className="flex items-center gap-2 text-sm text-neutral-500">
            <DollarSign className="h-4 w-4" />
            Total agregado estaciones
          </span>
          <span className="font-semibold text-white">{formatUsd(totalStationRevenue)}</span>
        </div>
      </div>
    </div>
  );
}
