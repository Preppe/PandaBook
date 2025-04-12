import { config } from '../config';

// --- Type Definitions (Based on backend API) ---

export interface LoginDto {
    email: string;
    password?: string; // Password might be optional for social logins etc.
    // Add other fields like provider if supporting social login
}

export interface User {
    id: string | number;
    email: string;
    firstName?: string;
    lastName?: string;
    // Add other relevant user fields
}

// --- Token Management ---

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Retrieves the access token from localStorage.
 * @returns The access token or null if not found.
 */
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null; // Avoid server-side errors
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Retrieves the refresh token from localStorage.
 * @returns The refresh token or null if not found.
 */
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Stores access and refresh tokens in localStorage.
 * @param accessToken - The access token.
 * * @param refreshToken - The refresh token.
 */
/**
 * Stores access and refresh tokens in localStorage, with validation.
 * Throws an error if accessToken is missing or invalid.
 */
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

/**
 * Removes access and refresh tokens from localStorage.
 */
const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// --- API Client Functions ---

const { baseUrl, endpoints } = config.api;

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}

interface RefreshResponse {
    accessToken: string;
    refreshToken: string; // Backend might return a new refresh token as well
}

/**
 * Helper to make fetch requests with common settings.
 */
const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${baseUrl}${endpoint}`;
  const accessToken = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }), // Add Authorization header if token exists
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      // Attempt to parse error details from the response body
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if response body is not JSON or empty
      }
      console.error('API Error:', response.status, response.statusText, errorData);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    // Handle cases where the response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
        return undefined as T; // Or handle as appropriate for the specific call
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('API Client Fetch Error:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Logs in a user.
 * @param credentials - Email and password.
 * @returns The logged-in user data.
 */
export const loginUser = async (credentials: LoginDto): Promise<User> => {
  const response = await apiClient<LoginResponse>(endpoints.auth.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  setTokens(response.token, response.refreshToken);
  return response.user;
};

/**
 * Logs out the current user.
 * Clears tokens locally. Optionally sends request to backend if needed.
 */
export const logoutUser = async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    // Optionally call the backend logout endpoint if it requires the refresh token
    // to invalidate the session server-side.
    try {
        if (refreshToken) {
             await apiClient<void>(endpoints.auth.logout, {
                 method: 'POST',
                 // Backend might expect refresh token in body or specific header
                 // body: JSON.stringify({ refreshToken }),
             });
        }
    } catch (error) {
        // Log error but proceed with local token removal
        console.error('Backend logout failed, proceeding with local logout:', error);
    } finally {
        // Always remove tokens locally regardless of backend call success
        removeTokens();
    }
};


/**
 * Fetches the currently authenticated user's data.
 * @returns The user data or null if not authenticated.
 */
export const fetchCurrentUser = async (): Promise<User | null> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null; // Not authenticated locally
  }

  try {
    const user = await apiClient<User>(endpoints.auth.me, {
      method: 'GET',
    });
    return user;
  } catch (error: any) {
    // Handle specific errors, e.g., 401 Unauthorized might mean token expired
    if (error.message?.includes('401')) { // Basic check, refine as needed
      console.warn('Access token might be expired.');
      // Optionally trigger token refresh here or let AuthGuard handle it
      removeTokens(); // Clear potentially invalid token
      return null;
    }
    console.error('Failed to fetch current user:', error);
    return null; // Return null on other errors
  }
};

/**
 * Refreshes the access token using the refresh token.
 * @returns The new access token or null if refresh fails.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('No refresh token available.');
    return null;
  }

  try {
    const response = await apiClient<RefreshResponse>(endpoints.auth.refresh, {
      method: 'POST',
      // Backend expects refresh token in the body or a specific header
      body: JSON.stringify({ refreshToken }),
      headers: {
        // No Authorization header needed for refresh typically
        'Content-Type': 'application/json',
      }
    });
    // Update tokens with the new ones received
    setTokens(response.accessToken, response.refreshToken || refreshToken); // Use new refresh token if provided
    console.log('Access token refreshed successfully.');
    return response.accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    // If refresh fails (e.g., refresh token expired or invalid), clear tokens
    removeTokens();
    return null;
  }
};

// --- Re-export helpers if needed elsewhere ---
export { getAccessToken, removeTokens };

// --- Placeholder types defined at the top of the file ---