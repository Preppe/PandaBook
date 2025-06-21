/**
 * Represents the metadata structure of a paginated response from the API.
 */
export interface PaginateMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy?: string[][]; // Optional as it might not always be present
  search?: string; // Optional
  filter?: { [column: string]: string | string[] }; // Optional
}

/**
 * Represents the links structure of a paginated response from the API.
 */
export interface PaginateLinks {
  first?: string;
  previous?: string;
  current: string;
  next?: string;
  last?: string;
}

/**
 * Represents the structure of a paginated response from the API.
 * @template T The type of the items in the data array.
 */
export interface Paginated<T> {
  data: T[];
  meta: PaginateMeta;
  links: PaginateLinks;
}
