/**
 * Centralized API Service for RefineBoard
 * All network requests go through this module.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'refineboard_auth_token';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },
    register: async (name: string, email: string, password: string) => {
      const res = await request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },
    me: async () => {
      return request<{ user: any }>('/auth/me', { method: 'GET' });
    },
  },

  // User Stories
  stories: {
    getAll: async () => request<any[]>('/stories', { method: 'GET' }),
    getById: async (id: string) => request<any>(`/stories/${id}`, { method: 'GET' }),
    create: async (data: any) =>
      request<any>('/stories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (id: string, changes: any, activityEntry?: any) =>
      request<any>(`/stories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ changes, activityEntry }),
      }),
    delete: async (id: string) => request<{ message: string }>(`/stories/${id}`, { method: 'DELETE' }),
    reorder: async (orderedIds: string[]) =>
      request<{ message: string }>('/stories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      }),
    addDependency: async (storyId: string, dep: { targetStoryId: string; title: string; type: string }) =>
      request<any>(`/stories/${storyId}/dependencies`, {
        method: 'POST',
        body: JSON.stringify(dep),
      }),
    removeDependency: async (storyId: string, depTargetId: string) =>
      request<{ message: string }>(`/stories/${storyId}/dependencies/${depTargetId}`, {
        method: 'DELETE',
      }),
  },

  // Acceptance Criteria
  criteria: {
    getByStory: async (storyId: string) =>
      request<any[]>(`/stories/${storyId}/acceptance-criteria`, { method: 'GET' }),
    create: async (storyId: string, criterion: any) =>
      request<any>(`/stories/${storyId}/acceptance-criteria`, {
        method: 'POST',
        body: JSON.stringify(criterion),
      }),
    update: async (criterionId: string, changes: any) =>
      request<any>(`/acceptance-criteria/${criterionId}`, {
        method: 'PUT',
        body: JSON.stringify(changes),
      }),
    delete: async (criterionId: string) =>
      request<{ message: string }>(`/acceptance-criteria/${criterionId}`, {
        method: 'DELETE',
      }),
  },

  // Sprints
  sprints: {
    getAll: async () => request<any[]>('/sprints', { method: 'GET' }),
    create: async (data: any) =>
      request<any>('/sprints', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (id: string, data: any) =>
      request<any>(`/sprints/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Team
  team: {
    getAll: async () => request<any[]>('/team', { method: 'GET' }),
    create: async (data: any) =>
      request<any>('/team', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Settings
  settings: {
    get: async () => request<any>('/settings', { method: 'GET' }),
    update: async (changes: any) =>
      request<any>('/settings', {
        method: 'PUT',
        body: JSON.stringify(changes),
      }),
  },
};
