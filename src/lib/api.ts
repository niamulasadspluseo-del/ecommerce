let raw = (import.meta as any).env?.VITE_API_URL || "";
if (raw && !raw.startsWith("http://") && !raw.startsWith("https://")) raw = "https://" + raw;
const API_BASE = raw;

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem("auth_token", t);
  else localStorage.removeItem("auth_token");
}

export function getToken(): string | null {
  if (token) return token;
  token = localStorage.getItem("auth_token");
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const t = getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
