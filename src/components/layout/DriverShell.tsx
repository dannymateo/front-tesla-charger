"use client";

import { Battery, CreditCard, Map, User } from "lucide-react";
import { TabShell, type TabNavItem } from "@/components/layout/TabShell";

const navItems: TabNavItem[] = [
  { href: "/driver/map", label: "Mapa", icon: Map },
  {
    href: "/driver/charging/active",
    label: "Carga",
    icon: Battery,
    matchPrefix: "/driver/charging",
  },
  { href: "/driver/billing", label: "Facturas", icon: CreditCard },
  { href: "/driver/profile", label: "Perfil", icon: User },
];

export function DriverShell({ children }: { children: React.ReactNode }) {
  return (
    <TabShell items={navItems} homeHref="/driver/map" desktopNavFrom="md">
      {children}
    </TabShell>
  );
}
