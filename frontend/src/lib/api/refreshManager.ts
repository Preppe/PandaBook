/**
 * RefreshManager: Handles token refresh logic.
 * - Uses refreshToken in the standard Authorization header as Bearer, never the accessToken.
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

export async function refreshTokens(apiBaseUrl: string): Promise<RefreshResponse> {
  const storedRefreshToken = tokenManager.getRefreshToken();
  if (!storedRefreshToken) {
    throw { message: 'No refresh token available' } as ApiError;
  }

  try {
    const response: Response = await fetch(`${apiBaseUrl}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storedRefreshToken}`,
      },
      // No accessToken attached!
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      throw handleApiError({ response: { status: response.status, data: errorData } });
    }

    const data: any = await response.json();
    // Accept both 'accessToken' or 'token' for compatibility
    const accessToken: string = data.accessToken || data.token;
    const newRefreshToken: string = data.refreshToken;
    if (!accessToken || !newRefreshToken) {
      throw { message: 'Invalid refresh response', data } as ApiError;
    }

    // Update tokens in TokenManager
    tokenManager.setTokens({
      accessToken,
      refreshToken: newRefreshToken,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}