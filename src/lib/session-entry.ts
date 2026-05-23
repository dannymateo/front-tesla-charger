export const SESSION_ENTRY_KEY = "tesla-session-entry";
/** Minimum time the entry loader stays visible (ms). */
export const SESSION_ENTRY_MIN_MS = 3500;
/** Fade-out duration before unmounting the loader (ms). */
export const SESSION_ENTRY_EXIT_MS = 600;

export function markSessionEntry(): void {
  sessionStorage.setItem(SESSION_ENTRY_KEY, String(Date.now()));
}

export function clearSessionEntry(): void {
  sessionStorage.removeItem(SESSION_ENTRY_KEY);
}

export function getSessionEntryStartedAt(): number | null {
  const raw = sessionStorage.getItem(SESSION_ENTRY_KEY);
  if (!raw) return null;
  const started = Number(raw);
  return Number.isNaN(started) ? null : started;
}
