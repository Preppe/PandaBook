import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { config } from '../config';

// --- Type Definitions (Based on backend API) ---

export interface LoginDto {
    email: string;
    password?: string; // Password might be optional for social logins etc.
    // Add other fields like provider if supporting social login
}

import type { User } from '../models/User';

// --- Token Management ---

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  if (!accessToken || typeof accessToken !== 'string' || accessToken === 'undefined') {
    console.error('setTokens: accessToken is missing or invalid:', accessToken);
    throw new Error('Token non ricevuto dalla risposta di login');
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken && typeof refreshToken === 'string' && refreshToken !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// --- API Client Helper ---

const { baseUrl, endpoints } = config.api;

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}

interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${baseUrl}${endpoint}`;
  const accessToken = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {}
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw error;
  }
};

// --- TanStack Query Hooks ---

// 1. Login Mutation
export function useLoginUser(options?: UseMutationOptions<User, Error, LoginDto>) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, LoginDto>({
    mutationFn: async (credentials: LoginDto) => {
      const response = await apiClient<LoginResponse>(endpoints.auth.login, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      setTokens(response.token, response.refreshToken);
      return response.user;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

// 2. Logout Mutation
export function useLogoutUser(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      try {
        if (refreshToken) {
          await apiClient<void>(endpoints.auth.logout, {
            method: 'POST',
            // Optionally send refreshToken in body if backend expects it
            // body: JSON.stringify({ refreshToken }),
          });
        }
      } catch (error) {
        // Log error but proceed with local token removal
        console.error('Backend logout failed, proceeding with local logout:', error);
      } finally {
        removeTokens();
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

// 3. Current User Query
export function useCurrentUser(options?: UseQueryOptions<User | null, Error>) {
  return useQuery<User | null, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const accessToken = getAccessToken();
      if (!accessToken) return null;
      try {
        const user = await apiClient<User>(endpoints.auth.me, { method: 'GET' });
        return user;
      } catch (error: any) {
        if (error.message?.includes('401')) {
          removeTokens();
          return null;
        }
        throw error;
      }
    },
    ...options,
  });
}

// 4. Refresh Token Mutation
export function useRefreshAccessToken(options?: UseMutationOptions<string | null, Error, void>) {
  const queryClient = useQueryClient();
  return useMutation<string | null, Error, void>({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return null;
      }
      try {
        const response = await apiClient<RefreshResponse>(endpoints.auth.refresh, {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
          headers: { 'Content-Type': 'application/json' },
        });
        setTokens(response.accessToken, response.refreshToken || refreshToken);
        return response.accessToken;
      } catch (error) {
        removeTokens();
        return null;
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

// --- Re-export helpers if needed elsewhere ---
export { getAccessToken, removeTokens };