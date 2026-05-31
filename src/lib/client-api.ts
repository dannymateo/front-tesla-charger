import { ApiClientError, parseApiError } from "./api-error";
import { REJECTION_MESSAGES } from "./constants";

type ClientFetchOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
};

/** @deprecated Use parseApiError from api-error.ts */
export function extractApiError(data: unknown): { message: string; code?: string } {
  const parsed = parseApiError(data);
  if (parsed.code && REJECTION_MESSAGES[parsed.code] && !parsed.details) {
    return { code: parsed.code, message: REJECTION_MESSAGES[parsed.code] };
  }
  return { message: parsed.message, code: parsed.code };
}

export async function clientApi<T>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<T> {
  const url = new URL(
    `/api/backend${path.startsWith("/") ? path : `/${path}`}`,
    window.location.origin,
  );

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new ApiClientError(
      "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
      "NETWORK_ERROR",
      503,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = response.ok ? {} : { message: "Error desconocido" };
  }

  if (!response.ok) {
    const parsed = parseApiError(data, response.status);
    throw new ApiClientError(
      parsed.message,
      parsed.code,
      response.status,
      parsed.details,
    );
  }

  return data as T;
}

export async function clientApiWithCode<T>(
  path: string,
  options: ClientFetchOptions = {},
): Promise<{ data: T; status: number; ok: boolean }> {
  const url = new URL(
    `/api/backend${path.startsWith("/") ? path : `/${path}`}`,
    window.location.origin,
  );

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    return {
      data: { message: "network", code: "NETWORK_ERROR" } as T,
      status: 503,
      ok: false,
    };
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    data = {} as T;
  }

  return { data, status: response.status, ok: response.ok };
}
