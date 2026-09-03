const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(payload.message ?? 'The request failed');
  }

  return response.json() as Promise<T>;
}
