import { cn } from "@/lib/utils";
import {
  TESLA_MARK_PATHS,
  TESLA_MARK_VIEWBOX,
} from "./tesla-mark-paths";
import {
  TESLA_WORDMARK_PATHS,
  TESLA_WORDMARK_VIEWBOX,
} from "./tesla-wordmark-paths";

type TeslaLogoProps = {
  className?: string;
  /** icon = red T emblem only; wordmark = TESLA letters */
  variant?: "wordmark" | "icon";
  markClassName?: string;
  wordmarkClassName?: string;
};

/** Red T emblem — favicon and tight spaces. */
export function TeslaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={TESLA_MARK_VIEWBOX}
      className={cn("h-full w-full shrink-0", className)}
      aria-hidden
    >
      <g fill="currentColor">
        {TESLA_MARK_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Horizontal TESLA wordmark. */
export function TeslaWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={TESLA_WORDMARK_VIEWBOX}
      className={cn("h-full w-full shrink-0", className)}
      aria-label="Tesla"
      role="img"
    >
      <g fill="currentColor">
        {TESLA_WORDMARK_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

export function TeslaLogo({
  className,
  variant = "wordmark",
  markClassName,
  wordmarkClassName,
}: TeslaLogoProps) {
  if (variant === "icon") {
    return (
      <div
        className={cn(
          "flex h-8 w-7 shrink-0 items-center justify-center text-tesla-red",
          className,
          markClassName,
        )}
      >
        <TeslaMark />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-6 w-28 text-white sm:h-7 sm:w-32",
        className,
        wordmarkClassName,
      )}
    >
      <TeslaWordmark />
    </div>
  );
}
