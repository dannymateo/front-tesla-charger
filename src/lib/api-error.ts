export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export const ADMIN_STATION_ERRORS: Record<string, string> = {
  STATION_HAS_ACTIVE_SESSIONS:
    "No se puede deshabilitar la estación mientras haya sesiones de carga activas.",
};

const SERVICE_LABELS: Record<string, string> = {
  "auth-service": "autenticación",
  "stations-service": "estaciones",
  "sessions-service": "sesiones",
  "billing-service": "facturación",
  gateway: "API",
};

const SERVICE_UNAVAILABLE_PATTERN =
  /(\w+-service)\s+did not respond|did not respond in time|service unavailable|econnrefused|enotfound|fetch failed|network error/i;

function extractServiceName(message: string): string | null {
  const match = message.match(/(\w+-service)\s+did not respond/i);
  return match?.[1] ?? null;
}

export function isServiceUnavailableMessage(message: string): boolean {
  return SERVICE_UNAVAILABLE_PATTERN.test(message);
}

export function isServiceUnavailableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.code === "SERVICE_UNAVAILABLE" || error.code === "NETWORK_ERROR") {
      return true;
    }
    if (error.status && error.status >= 502 && error.status <= 504) {
      return true;
    }
    return isServiceUnavailableMessage(error.message);
  }

  if (error instanceof Error) {
    return isServiceUnavailableMessage(error.message);
  }

  return false;
}

export function formatApiErrorMessage(
  message: string,
  status?: number,
  code?: string,
): string {
  if (code === "NETWORK_ERROR" || message === "network") {
    return "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.";
  }

  if (status === 502 || status === 503 || status === 504) {
    const service = extractServiceName(message);
    if (service && SERVICE_LABELS[service]) {
      return `El servicio de ${SERVICE_LABELS[service]} no está disponible en este momento. Inténtalo de nuevo más tarde.`;
    }
    return "Uno de los servicios no está disponible en este momento. Inténtalo de nuevo más tarde.";
  }

  if (isServiceUnavailableMessage(message)) {
    const service = extractServiceName(message);
    if (service && SERVICE_LABELS[service]) {
      return `El servicio de ${SERVICE_LABELS[service]} no está disponible en este momento. Inténtalo de nuevo más tarde.`;
    }
    return "Uno de los servicios no está disponible en este momento. Inténtalo de nuevo más tarde.";
  }

  return message;
}

export function parseApiError(
  data: unknown,
  status?: number,
): { message: string; code?: string; details?: Record<string, unknown> } {
  if (!data || typeof data !== "object") {
    const fallback =
      status && status >= 502
        ? formatApiErrorMessage("", status, "SERVICE_UNAVAILABLE")
        : "Error desconocido";
    return {
      message: fallback,
      code: status && status >= 502 ? "SERVICE_UNAVAILABLE" : undefined,
    };
  }

  const record = data as Record<string, unknown>;

  if (typeof record.code === "string") {
    const rawMessage =
      typeof record.message === "string"
        ? record.message
        : ADMIN_STATION_ERRORS[record.code] ?? record.code;
    return {
      code: record.code,
      message: formatApiErrorMessage(rawMessage, status, record.code),
      details: record,
    };
  }

  if (typeof record.message === "string") {
    const code = isServiceUnavailableMessage(record.message)
      ? "SERVICE_UNAVAILABLE"
      : undefined;
    return {
      message: formatApiErrorMessage(record.message, status, code),
      code,
      details: record,
    };
  }

  if (record.message && typeof record.message === "object") {
    const nested = record.message as Record<string, unknown>;
    const code = typeof nested.code === "string" ? nested.code : undefined;
    const rawMessage =
      typeof nested.message === "string"
        ? nested.message
        : code && ADMIN_STATION_ERRORS[code]
          ? ADMIN_STATION_ERRORS[code]
          : "No se pudo completar la operación";

    return {
      code,
      message: formatApiErrorMessage(rawMessage, status, code),
      details: nested,
    };
  }

  if (Array.isArray(record.message)) {
    return { message: record.message.join(", ") };
  }

  if (status && status >= 502) {
    return {
      message: formatApiErrorMessage("", status, "SERVICE_UNAVAILABLE"),
      code: "SERVICE_UNAVAILABLE",
    };
  }

  return { message: "No se pudo completar la operación" };
}

export function formatAdminStationError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === "STATION_HAS_ACTIVE_SESSIONS") {
      const count = error.details?.activeSessions;
      if (typeof count === "number" && count > 0) {
        return `Hay ${count} sesión(es) de carga en curso. Espera a que finalicen antes de deshabilitar.`;
      }
      return ADMIN_STATION_ERRORS.STATION_HAS_ACTIVE_SESSIONS;
    }

    if (error.code && ADMIN_STATION_ERRORS[error.code]) {
      return ADMIN_STATION_ERRORS[error.code];
    }

    return error.message;
  }

  if (error instanceof Error) {
    return formatApiErrorMessage(error.message);
  }

  return "Ocurrió un error inesperado";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return formatApiErrorMessage(error.message);
  }
  return "Ocurrió un error inesperado";
}
