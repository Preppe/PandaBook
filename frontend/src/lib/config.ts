/**
 * Configuration settings for the application.
 * Reads environment variables and provides default values.
 */

// Ensure environment variables are prefixed with NEXT_PUBLIC_ to be exposed to the browser.
// See: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'; // Default to local backend if not set

export const config = {
  api: {
    baseUrl: apiBaseUrl,
    endpoints: {
      auth: {
        login: '/auth/email/login',
        logout: '/auth/logout',
        me: '/auth/me',
        refresh: '/auth/refresh',
      },
      // Add other API endpoints here as needed
    },
  },
  // Add other configuration sections here (e.g., feature flags)
};

// Log the configuration being used during development for easier debugging
if (process.env.NODE_ENV === 'development') {
  console.log('App Configuration:', config);
}