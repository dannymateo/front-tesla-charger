"use client";

import { BarChart3, Map, Users, Zap } from "lucide-react";
import { TabShell, type TabNavItem } from "@/components/layout/TabShell";

const navItems: TabNavItem[] = [
  { href: "/admin/map", label: "Mapa en vivo", shortLabel: "Mapa", icon: Map },
  { href: "/admin/stations", label: "Estaciones", shortLabel: "Estaciones", icon: Zap },
  { href: "/admin/users", label: "Usuarios", shortLabel: "Usuarios", icon: Users },
  { href: "/admin/dashboard", label: "Finanzas", shortLabel: "Finanzas", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <TabShell items={navItems} homeHref="/admin/map" desktopNavFrom="md">
      {children}
    </TabShell>
  );
}
