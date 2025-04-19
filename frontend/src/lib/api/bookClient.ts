import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { Book } from '../models/Book';
import type { Audio } from '../models/Audio';
import apiClient from './apiClient';

// --- Paginate Types (nestjs-paginate) ---
export interface PaginateMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginateLinks {
  first: string;
  previous?: string;
  next?: string;
  last: string;
}

export interface Paginate<Book> {
  data: Book[];
  meta: PaginateMeta;
  links: PaginateLinks;
}

// --- API Client Helper ---

// --- TanStack Query Hooks ---

// 1. Paginated Books List
export function useBooks(
  params: Record<string, any> = {},
  options?: UseQueryOptions<Paginate<Book>, Error>
) {
  // Build query string for pagination/filtering
  const queryString = new URLSearchParams(params).toString();
  const endpoint = '/books';
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return useQuery<Paginate<Book>, Error>({
    queryKey: ['books', params],
    queryFn: () => apiClient(url),
    ...options,
  });
}

// 2. Single Book Fetch
export function useBook(
  bookId: string,
  options?: UseQueryOptions<Book, Error>
) {
  const endpoint = `/books/${bookId}`;

  return useQuery<Book, Error>({
    queryKey: ['book', bookId],
    queryFn: () => apiClient(endpoint),
    ...options,
  });
}

// 3. Book Audio Metadata Fetch
export function useBookAudio(
  bookId: string,
  options?: UseQueryOptions<Audio, Error>
) {
  const endpoint = `/books/audio/${bookId}`;

  return useQuery<Audio, Error>({
    queryKey: ['bookAudio', bookId],
    queryFn: () => apiClient(endpoint),
    ...options,
  });
}