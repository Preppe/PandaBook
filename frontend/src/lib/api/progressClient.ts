import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Represents the structure of the progress response for a single book from the API.
 */
export interface ProgressResponse {
  time: number;
}

/**
 * Represents the structure of an AudiobookProgress entity from the backend.
 */
export interface AudiobookProgress {
  id: string;
  userId: string;
  bookId: string;
  time: number;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// Import Paginated type from the shared types file
import type { Paginated } from '../types/pagination';


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
  const endpoint = bookId ? `/progress/${bookId}` : '';

  return useQuery<ProgressResponse, Error>({
    queryKey: ['progress', userId, bookId],
    queryFn: async () => {
      if (!userId || !bookId) {
        throw new Error('userId and bookId are required to fetch progress.');
      }
      return apiClient(endpoint);
    },
    enabled: !!userId && !!bookId,
    ...options,
  });
}

/**
 * Fetches the authenticated user's paginated audiobook progress.
 * By default, results are sorted by 'updatedAt' descending.
 *
 * @param options - Optional TanStack Query options.
 * @returns The TanStack Query result object containing paginated progress data.
 */
export function useFetchPaginatedProgress(
  options?: UseQueryOptions<Paginated<AudiobookProgress>, Error>
) {
  const endpoint = '/progress'; // The new paginated endpoint

  return useQuery<Paginated<AudiobookProgress>, Error>({
    queryKey: ['paginatedProgress'], // A simple key for the list
    queryFn: async () => {
      // apiClient should handle appending pagination query parameters if needed,
      // but for fetching the most recent, default sorting is sufficient.
      return apiClient(endpoint);
    },
    // This query can be enabled by default as it fetches the user's progress list
    // enabled: true, // useQuery is enabled by default unless explicitly set to false
    ...options,
  });
}
