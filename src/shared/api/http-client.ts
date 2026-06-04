import { ApiError, type ApiErrorResponse } from "./api-error";
import { env } from "@/src/shared/config/env";
import { getAccessToken } from "@/src/shared/auth/supabase";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  const token = await getAccessToken();

  try {
    if (options.auth !== false && !token) {
      throw new ApiError(401, {
        code: "AUTH_SESSION_REQUIRED",
        message: "Inicia sesion nuevamente para continuar.",
      });
    }

    const response = await fetch(`${env.apiUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.auth !== false && token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
      let payload: ApiErrorResponse;
      try {
        payload = (await response.json()) as ApiErrorResponse;
      } catch {
        payload = {
          code: `HTTP_${response.status}`,
          message: "No se pudo completar la solicitud.",
        };
      }
      throw new ApiError(response.status, payload);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};
