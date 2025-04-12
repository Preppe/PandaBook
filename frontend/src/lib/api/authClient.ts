import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import type { User } from '../models/User';
import apiClient from './apiClient';
import tokenManager from './tokenManager';
import { refreshTokens } from './refreshManager';

// --- Type Definitions (Based on backend API) ---

export interface LoginDto {
    email: string;
    password?: string; // Password might be optional for social logins etc.
    // Add other fields like provider if supporting social login
}

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

// --- API Endpoints ---

// --- TanStack Query Hooks ---

// 1. Login Mutation
export function useLoginUser(options?: UseMutationOptions<User, Error, LoginDto>) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, LoginDto>({
    mutationFn: async (credentials: LoginDto) => {
      const response = await apiClient('/auth/email/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      // Save tokens
      tokenManager.setTokens({
        accessToken: response.token,
        refreshToken: response.refreshToken,
      });
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
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          await apiClient('/auth/logout', {
            method: 'POST',
            // Optionally send refreshToken in body if backend expects it
            // body: JSON.stringify({ refreshToken }),
          });
        }
      } catch (error) {
        // Log error but proceed with local token removal
        console.error('Backend logout failed, proceeding with local logout:', error);
      } finally {
        tokenManager.clearTokens();
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
      const accessToken = tokenManager.getAccessToken();
      if (!accessToken) return null;
      try {
        const user = await apiClient('/auth/me', { method: 'GET' });
        return user;
      } catch (error: any) {
        if (error.message?.includes('401')) {
          tokenManager.clearTokens();
          return null;
        }
        throw error;
      }
    },
    ...options,
  });
}

// 4. Refresh Token Mutation (uses refreshManager)
export function useRefreshAccessToken(options?: UseMutationOptions<string | null, Error, void>) {
  const queryClient = useQueryClient();
  return useMutation<string | null, Error, void>({
    mutationFn: async () => {
      try {
        const apiBaseUrl = '/auth/refresh-token';
        const { accessToken, refreshToken } = await refreshTokens(apiBaseUrl);
        return accessToken;
      } catch (error) {
        tokenManager.clearTokens();
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
export { tokenManager };