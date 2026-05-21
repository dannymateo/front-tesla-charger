import { STATION_STATE_COLORS, STATION_STATE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  state: string;
  showDot?: boolean;
  className?: string;
};

export function StatusBadge({ state, showDot = true, className }: StatusBadgeProps) {
  const color = STATION_STATE_COLORS[state] ?? "#8E8E93";
  const label = STATION_STATE_LABELS[state] ?? state;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white",
        className,
      )}
    >
      {showDot && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      )}
      {label}
    </span>
  );
}
