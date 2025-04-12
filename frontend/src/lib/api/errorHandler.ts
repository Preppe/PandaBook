/**
 * ErrorHandler: Centralizes error handling for API requests.
 * Can be extended for logging, user notifications, or error transformation.
 * Modular and testable.
 */

export interface ApiError {
  status?: number;
  message: string;
  data?: any;
  originalError?: any;
}

export function handleApiError(error: any): ApiError {
  // Axios-style error
  if (error?.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.response.statusText || 'API Error',
      data: error.response.data,
      originalError: error,
    };
  }
  // Fetch-style error
  if (error?.status && error?.json) {
    return {
      status: error.status,
      message: error.statusText || 'API Error',
      data: error.json,
      originalError: error,
    };
  }
  // Network or unknown error
  return {
    message: error?.message || 'Unknown error',
    originalError: error,
  };
}

// Optionally, add logging or UI notification hooks here.