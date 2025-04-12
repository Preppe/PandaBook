/**
 * apiClient: The only HTTP client for all API modules.
 * - Attaches Bearer accessToken to all requests except refresh endpoint.
 * - On 401/403, attempts token refresh and retries once.
 * - Modular, extensible, and testable.
 */

import tokenManager from './tokenManager';
import { refreshTokens } from './refreshManager';
import { handleApiError, ApiError } from './errorHandler';

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean; // For endpoints like /auth/refresh
  apiBaseUrl?: string; // Override base URL if needed
  headers?: HeadersInit; // Accepts Headers, object, or array
}

const DEFAULT_API_BASE_URL = '/api'; // Can be configured

async function apiClient(
  endpoint: string,
  options: ApiClientOptions = {},
  retry = true
): Promise<any> {
  const {
    skipAuth = false,
    apiBaseUrl = DEFAULT_API_BASE_URL,
    headers,
    ...rest
  } = options;

  let accessToken = tokenManager.getAccessToken();

  // Normalize headers to a plain object
  function normalizeHeaders(h: HeadersInit | undefined): Record<string, string> {
    if (!h) return {};
    if (h instanceof Headers) {
      const obj: Record<string, string> = {};
      h.forEach((v, k) => { obj[k] = v; });
      return obj;
    }
    if (Array.isArray(h)) {
      return Object.fromEntries(h);
    }
    return { ...h };
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...normalizeHeaders(headers),
  };
  if (!skipAuth && accessToken) {
    reqHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: reqHeaders,
      ...rest,
    });

    if (response.ok) {
      // Try to parse JSON, fallback to text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }

    // If unauthorized, try refresh logic (unless already retried or skipAuth)
    if (
      !skipAuth &&
      retry &&
      (response.status === 401 || response.status === 403)
    ) {
      try {
        await refreshTokens(apiBaseUrl);
        // Retry original request with new accessToken
        return await apiClient(endpoint, options, false);
      } catch (refreshError) {
        // Refresh failed, clear tokens
        tokenManager.clearTokens();
        throw refreshError;
      }
    }

    // Other errors
    const errorData = await response.json().catch(() => ({}));
    throw handleApiError({ response: { status: response.status, data: errorData } });
  } catch (error) {
    throw handleApiError(error);
  }
}

export default apiClient;