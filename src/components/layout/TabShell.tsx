"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { TeslaLogo } from "@/components/brand/TeslaLogo";
import { TeslaSessionLoader } from "@/components/brand/TeslaSessionLoader";
import { useSessionEntryLoader } from "@/hooks/useSessionEntryLoader";
import { cn } from "@/lib/utils";

export type TabNavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  matchPrefix?: string;
};

export function isTabActive(
  pathname: string,
  href: string,
  matchPrefix?: string,
): boolean {
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return pathname.startsWith(href);
}

function isMapRoute(pathname: string): boolean {
  return pathname === "/driver/map" || pathname === "/admin/map";
}

type TabShellProps = {
  items: TabNavItem[];
  homeHref: string;
  desktopNavFrom?: "md" | "lg";
  children: React.ReactNode;
};

const DESKTOP_MD = {
  navShow: "hidden md:flex",
  mainPb: "md:pb-0",
  bottomHide: "md:hidden",
} as const;

const DESKTOP_LG = {
  navShow: "hidden lg:flex",
  mainPb: "lg:pb-0",
  bottomHide: "lg:hidden",
} as const;

function NavTabLink({
  href,
  label,
  icon: Icon,
  matchPrefix,
  pathname,
  variant,
}: TabNavItem & { pathname: string; variant: "desktop" | "mobile" }) {
  const active = isTabActive(pathname, href, matchPrefix);

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className={cn(
          "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors",
          active ? "text-tesla-red" : "text-neutral-500 active:text-neutral-300",
        )}
      >
        {active && (
          <span
            className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-tesla-red"
            aria-hidden
          />
        )}
        <Icon
          className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(227,25,55,0.45)]")}
          strokeWidth={active ? 2.5 : 2}
        />
        <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-tesla-red/15 text-tesla-red ring-1 ring-tesla-red/30"
          : "text-neutral-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function TabShell({
  items,
  homeHref,
  desktopNavFrom = "md",
  children,
}: TabShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { active: showEntryLoader, exiting: entryLoaderExiting } =
    useSessionEntryLoader();
  const desktop = desktopNavFrom === "lg" ? DESKTOP_LG : DESKTOP_MD;
  const mapView = isMapRoute(pathname);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-black bg-tesla-gradient">
      {showEntryLoader && (
        <TeslaSessionLoader exiting={entryLoaderExiting} />
      )}
      <header className="sticky top-0 z-40 shrink-0 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-8">
          <Link href={homeHref} className="relative z-10 shrink-0">
            <TeslaLogo />
          </Link>

          {/* Web — navbar centrada en el header */}
          <nav
            className={cn(
              "absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-neutral-900/60 p-1",
              desktop.navShow,
            )}
            aria-label="Navegación principal"
          >
            {items.map((item) => (
              <NavTabLink
                key={item.href}
                {...item}
                pathname={pathname}
                variant="desktop"
              />
            ))}
          </nav>

          <Button
            isIconOnly
            variant="light"
            className="relative z-10 shrink-0 text-neutral-400"
            aria-label="Cerrar sesión"
            onPress={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main
        className={cn(
          "flex-1 min-h-0",
          mapView ? "overflow-hidden" : "overflow-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
          desktop.mainPb,
          mapView && "md:pb-0",
        )}
      >
        {children}
      </main>

      {/* Móvil — tabs flotantes sobre el mapa */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[600] px-3",
          desktop.bottomHide,
        )}
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <nav
          className="pointer-events-auto w-full rounded-2xl border border-white/10 bg-neutral-950/95 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          aria-label="Navegación móvil"
        >
          <div className="flex h-16 w-full items-stretch">
            {items.map((item) => (
              <NavTabLink
                key={item.href}
                {...item}
                label={item.shortLabel ?? item.label}
                pathname={pathname}
                variant="mobile"
              />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
