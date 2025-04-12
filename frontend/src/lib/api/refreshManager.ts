/**
 * RefreshManager: Handles token refresh logic.
 * - Uses refreshToken in a custom header (e.g., 'x-refresh-token'), never the accessToken.
 * - Modular and testable.
 * - No hardcoded secrets or env vars.
 */

import tokenManager from './tokenManager';
import { handleApiError, ApiError } from './errorHandler';

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

const REFRESH_ENDPOINT = '/auth/refresh'; // Relative path, configurable if needed
const REFRESH_HEADER = 'x-refresh-token';

export async function refreshTokens(apiBaseUrl: string): Promise<RefreshResponse> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    throw { message: 'No refresh token available' } as ApiError;
  }

  try {
    const response = await fetch(`${apiBaseUrl}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [REFRESH_HEADER]: refreshToken,
      },
      // No accessToken attached!
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw handleApiError({ response: { status: response.status, data: errorData } });
    }

    const data = await response.json();
    if (!data.accessToken || !data.refreshToken) {
      throw { message: 'Invalid refresh response', data } as ApiError;
    }

    // Update tokens in TokenManager
    tokenManager.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}