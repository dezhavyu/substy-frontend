import { z } from "zod";
import { env } from "@/shared/lib/env";
import { routes } from "@/shared/lib/routes";
import { ApiError, AuthExpiredError } from "@/shared/api/errors";
import { bffErrorSchema } from "@/shared/api/schemas";
import { getAccessToken, setAccessToken } from "@/shared/lib/access-token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions<TResponse> {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  requiresAuth?: boolean;
  responseSchema: z.ZodType<TResponse, z.ZodTypeDef, unknown>;
}

let refreshPromise: Promise<boolean> | null = null;
const refreshResponseSchema = z.object({
  access_token: z.string().min(1)
});

function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }

  const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  let baseUrl = env.bffBaseUrl;

  if (typeof window !== "undefined") {
    try {
      const parsed = new URL(baseUrl);
      const currentHost = window.location.hostname;
      const currentIsLoopback = loopbackHosts.has(currentHost);

      // Keep frontend/backend on the same loopback host to avoid cookie isolation
      // when the app is opened on 127.0.0.1 but BFF URL points to localhost (or vice versa).
      if (loopbackHosts.has(parsed.hostname) && loopbackHosts.has(currentHost) && parsed.hostname !== currentHost) {
        parsed.hostname = currentHost;
        baseUrl = parsed.toString().replace(/\/$/, "");
      }

      // Allow container-internal hostnames (e.g. bff-gateway) in env while still
      // supporting browser access from localhost/127.0.0.1.
      if (!loopbackHosts.has(parsed.hostname) && currentIsLoopback) {
        parsed.hostname = currentHost;
        baseUrl = parsed.toString().replace(/\/$/, "");
      }
    } catch {
      // Ignore invalid env URL and use value as-is.
    }
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch {
    return text;
  }
}

function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== routes.login && window.location.pathname !== routes.register) {
    window.location.assign(routes.login);
  }
}

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(toAbsoluteUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      setAccessToken(null);
      return false;
    }

    const payload = await parseBody(response);
    const parsed = refreshResponseSchema.safeParse(payload);

    if (!parsed.success) {
      setAccessToken(null);
      return false;
    }

    setAccessToken(parsed.data.access_token);
    return true;
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

async function buildApiError(response: Response): Promise<ApiError> {
  const payload = await parseBody(response);
  const parsed = bffErrorSchema.safeParse(payload);

  if (parsed.success) {
    return new ApiError({
      status: response.status,
      code: parsed.data.code,
      message: parsed.data.message,
      requestId: parsed.data.request_id
    });
  }

  return new ApiError({
    status: response.status,
    code: `http_${response.status}`,
    message: response.statusText || "Request failed"
  });
}

export async function apiRequest<TResponse>(
  options: ApiRequestOptions<TResponse>
): Promise<TResponse> {
  const requiresAuth = options.requiresAuth ?? true;
  const method = options.method ?? "GET";
  let retriedAfterRefresh = false;

  while (true) {
    const headers = new Headers(options.headers);
    const accessToken = getAccessToken();

    if (requiresAuth && accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(toAbsoluteUrl(options.path), {
      method,
      credentials: "include",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal
    });

    if (response.status === 401 && requiresAuth && !retriedAfterRefresh) {
      retriedAfterRefresh = true;
      const refreshed = await refreshSession();

      if (refreshed) {
        continue;
      }

      redirectToLogin();
      throw new AuthExpiredError();
    }

    if (!response.ok) {
      throw await buildApiError(response);
    }

    if (response.status === 204) {
      return options.responseSchema.parse(undefined);
    }

    const payload = await parseBody(response);
    return options.responseSchema.parse(payload);
  }
}
