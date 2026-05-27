import { API_V1 } from "./constants";
import { ApiClientError, parseApiError } from "./api-error";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  query?: Record<string, string | undefined>;
};

export async function backendFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{ data: T; status: number }> {
  const url = new URL(`${API_V1}${path.startsWith("/") ? path : `/${path}`}`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return {
      data: {
        message: "network",
        code: "NETWORK_ERROR",
      } as T,
      status: 503,
    };
  }

  const text = await response.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    data = { message: text } as T;
  }

  return { data, status: response.status };
}

export async function backendFetchOrThrow<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { data, status } = await backendFetch<T>(path, options);
  if (status >= 400) {
    const parsed = parseApiError(data, status);
    throw new ApiClientError(parsed.message, parsed.code, status, parsed.details);
  }
  return data;
}

export async function backendFetchSafe<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{ data: T | null; error: ApiClientError | null }> {
  try {
    const data = await backendFetchOrThrow<T>(path, options);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new ApiClientError(
        "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
        "NETWORK_ERROR",
        503,
      ),
    };
  }
}
