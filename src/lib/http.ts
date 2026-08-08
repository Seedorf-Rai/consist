import type { ApiErrorBody } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const TOKEN_KEY = "the-pact:token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined>;

function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  opts: { body?: unknown; query?: Query; auth?: boolean } = {}
): Promise<T> {
  const { body, query, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${withQuery(path, query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, "Could not reach the server. Is the API running?");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data as ApiErrorBody | null)?.error || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const http = {
  get: <T>(path: string, query?: Query, auth?: boolean) => request<T>("GET", path, { query, auth }),
  post: <T>(path: string, body?: unknown, auth?: boolean) => request<T>("POST", path, { body, auth }),
  patch: <T>(path: string, body?: unknown, auth?: boolean) => request<T>("PATCH", path, { body, auth }),
  del: <T>(path: string, auth?: boolean) => request<T>("DELETE", path, { auth }),
};
