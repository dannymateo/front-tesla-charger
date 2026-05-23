"use client";

import { useEffect, useState } from "react";
import {
  clearSessionEntry,
  getSessionEntryStartedAt,
  SESSION_ENTRY_EXIT_MS,
  SESSION_ENTRY_MIN_MS,
} from "@/lib/session-entry";

type LoaderPhase = "idle" | "visible" | "exiting";

export function useSessionEntryLoader(
  minDuration = SESSION_ENTRY_MIN_MS,
  exitDuration = SESSION_ENTRY_EXIT_MS,
) {
  const [phase, setPhase] = useState<LoaderPhase>("idle");

  useEffect(() => {
    const started = getSessionEntryStartedAt();
    if (started === null) return;

    setPhase("visible");

    const elapsed = Date.now() - started;
    const remaining = Math.max(minDuration, minDuration - elapsed);

    const hideTimer = window.setTimeout(() => {
      clearSessionEntry();
      setPhase("exiting");
    }, remaining);

    const unmountTimer = window.setTimeout(() => {
      setPhase("idle");
    }, remaining + exitDuration);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [minDuration, exitDuration]);

  return {
    active: phase !== "idle",
    exiting: phase === "exiting",
  };
}
