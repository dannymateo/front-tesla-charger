export const AUTH_COOKIE = "tesla_token";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const API_V1 = `${API_BASE}/api/v1`;

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export const MEDELLIN_CENTER = {
  lat: 6.2442,
  lng: -75.5812,
} as const;

export const STATION_STATE_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  SATURATED: "Saturada",
  NO_CONNECTORS: "Sin conectores",
  DISABLED: "Deshabilitada",
};

export const STATION_STATE_COLORS: Record<string, string> = {
  AVAILABLE: "#34C759",
  SATURATED: "#FFCC00",
  NO_CONNECTORS: "#FF9500",
  DISABLED: "#FF3B30",
};

export const REJECTION_MESSAGES: Record<string, string> = {
  STATION_DISABLED: "La estación está deshabilitada",
  NO_CONNECTORS: "No hay conectores disponibles",
  NETWORK_SATURATED: "La red de la estación está saturada",
  USER_BLOCKED_DEBT: "Tienes deudas vencidas. Paga tus facturas para continuar",
  EXCEEDS_BATTERY_CAPACITY: "La carga supera la capacidad de tu batería",
  EXCEEDS_STATION_THRESHOLD: "La carga supera el máximo permitido en esta estación",
  USER_ALREADY_CHARGING: "Ya tienes una sesión de carga en progreso",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  OVERDUE: "Vencida",
};

export const DEMO_ACCOUNTS = [
  { email: "driver@tesla.local", role: "Conductor" },
  { email: "admin@tesla.local", role: "Administrador" },
  { email: "maria@tesla.local", role: "Conductor (deuda pendiente)" },
  { email: "blocked@tesla.local", role: "Conductor (bloqueado)" },
];

export const DEMO_PASSWORD = "Tesla123!";

export function getRoleHomePath(role: "USER" | "ADMIN"): string {
  return role === "ADMIN" ? "/admin/map" : "/driver/map";
}
