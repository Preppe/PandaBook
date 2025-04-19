import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Represents the structure of the progress response from the API.
 */
export interface ProgressResponse {
  time: number;
}

/**
 * Fetches the audiobook progress for a specific user and book.
 *
 * @param userId - The ID of the user.
 * @param bookId - The ID of the book.
 * @param options - Optional TanStack Query options.
 * @returns The TanStack Query result object.
 */
export function useFetchProgress(
  userId: string | undefined,
  bookId: string | undefined,
  options?: UseQueryOptions<ProgressResponse, Error>
) {
  // Updated endpoint to match backend controller (userId is implicit via JWT)
  const endpoint = bookId ? `/progress/${bookId}` : '';

  return useQuery<ProgressResponse, Error>({
    queryKey: ['progress', userId, bookId],
    queryFn: async () => {
      if (!userId || !bookId) {
        // This should not be called if enabled is false, but added for safety.
        throw new Error('userId and bookId are required to fetch progress.');
      }
      // apiClient should handle the actual request and potential errors
      // It returns Promise<any>, useQuery handles the type assertion.
      return apiClient(endpoint);
    },
    // Only enable the query if both userId and bookId are provided
    enabled: !!userId && !!bookId,
    // Allow overriding query options
    ...options,
  });
}