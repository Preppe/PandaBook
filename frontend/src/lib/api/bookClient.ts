import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { config } from '../config';
import type { Book } from '../models/Book';

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
  items: Book[];
  meta: PaginateMeta;
  links: PaginateLinks;
}

// --- API Client Helper ---
const { baseUrl } = config.api;

const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {}
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

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
    queryFn: () => apiClient<Paginate<Book>>(url),
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
    queryFn: () => apiClient<Book>(endpoint),
    ...options,
  });
}