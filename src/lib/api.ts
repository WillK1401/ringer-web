/**
 * API client — all calls to the Railway backend go through here.
 * Automatically attaches the Clerk session token to every request.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Wired up by <AuthTokenSync> in App.tsx using the real useAuth() hook
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function getToken(): Promise<string | null> {
  if (_getToken) return _getToken();
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Games ──────────────────────────────────────────────────────────────────

export const gamesApi = {
  getFeed: (params?: { day?: string; lat?: number; lng?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/games${qs ? `?${qs}` : ''}`);
  },
  getGame: (id: string) => request<{ game: any; players: any[] }>(`/games/${id}`),
  getMyGames: () => request<{ hosting: any[]; playing: any[] }>('/games/mine'),
  postGame: (data: any) => request<any>('/games', { method: 'POST', body: JSON.stringify(data) }),
  joinGame: (id: string) => request<any>(`/games/${id}/join`, { method: 'POST' }),
  cancelGame: (id: string, reason?: string) =>
    request<any>(`/games/${id}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
};

// ── Connections ────────────────────────────────────────────────────────────

export const connectionsApi = {
  getMyConnections: () => request<any[]>('/users/me/connections'),
  getPending: () => request<any[]>('/users/me/connections/pending'),
  send: (addresseeId: string) =>
    request<any>('/connections', { method: 'POST', body: JSON.stringify({ addresseeId }) }),
  accept: (id: string) =>
    request<any>(`/connections/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'accept' }) }),
  remove: (id: string) => request<any>(`/connections/${id}`, { method: 'DELETE' }),
};

// ── Users ──────────────────────────────────────────────────────────────────

export const usersApi = {
  getMe: () => request<any>('/users/me'),
  updateMe: (data: any) => request<any>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  getUser: (id: string) => request<any>(`/users/${id}`),
};

// ── Payments ───────────────────────────────────────────────────────────────

export const paymentsApi = {
  startOnboarding: () => request<{ onboardingUrl: string }>('/payments/stripe/onboard', { method: 'POST' }),
  getStatus: () => request<{ onboarded: boolean; chargesEnabled: boolean }>('/payments/stripe/status'),
};

// ── Chats ──────────────────────────────────────────────────────────────────

export const chatsApi = {
  getMyChats: () => request<{ id: string; venue: string; kickoff_at: string; role: 'organiser' | 'player' }[]>('/chats'),
};

// ── Notifications ──────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => request<any[]>('/notifications'),
  markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
};

// ── Groups ─────────────────────────────────────────────────────────────────

export const groupsApi = {
  getMyGroups: () => request<any[]>('/groups'),
  getGroup: (id: string) => request<any>(`/groups/${id}`),
};

// ── Health ─────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<{ status: string; services: any }>('/health'),
};
