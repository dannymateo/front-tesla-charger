import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel p-5 shadow-2xl shadow-black/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <GlassCard className="p-4">
      <p className="tesla-subheading mb-2">{label}</p>
      <p
        className="text-2xl font-semibold tracking-tight text-white"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </GlassCard>
  );
}
