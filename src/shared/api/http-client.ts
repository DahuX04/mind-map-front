import { ApiError, type ApiErrorResponse } from "./api-error";
import { env } from "@/src/shared/config/env";
import { getAccessToken } from "@/src/shared/auth/supabase";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    timeoutMs = 15_000,
    auth = true,
    headers,
    signal: externalSignal,
    ...requestInit
  } = options;
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const requiresAuth = auth;
  const token = requiresAuth ? await getAccessToken() : null;
  const hasBody = body !== undefined;
  const abortFromCaller = () => controller.abort();
  externalSignal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    if (requiresAuth && !token) {
      throw new ApiError(401, {
        code: "AUTH_SESSION_REQUIRED",
        message: "Inicia sesion nuevamente para continuar.",
      });
    }

    const response = await fetch(`${env.apiUrl}${path}`, {
      ...requestInit,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(requiresAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined,
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
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, {
        code: "REQUEST_TIMEOUT",
        message: "La solicitud demoro demasiado. Verifica tu conexion e intenta nuevamente.",
      });
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromCaller);
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
