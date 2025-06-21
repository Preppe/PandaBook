import { FilterOperator, PaginateConfig } from 'nestjs-paginate';
import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';
import { AudiobookProgress } from '../progress/entities/audiobook-progress.entity'; // Import AudiobookProgress

export const paginateConfigBook: PaginateConfig<Book> = {
  sortableColumns: ['id', 'title', 'author', 'createdAt', 'updatedAt'],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['title', 'author'],
  defaultLimit: 10,
  maxLimit: 50,
  filterableColumns: {
    title: [FilterOperator.ILIKE],
    author: [FilterOperator.ILIKE],
  },
};

export const paginateConfigUser: PaginateConfig<User> = {
  sortableColumns: [
    'id',
    'email',
    'firstName',
    'lastName',
    'provider',
    'createdAt',
    'updatedAt',
    'role.id', // Allow sorting by role ID
    'status.id', // Allow sorting by status ID
  ],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['email', 'firstName', 'lastName'],
  defaultLimit: 10,
  maxLimit: 50,
  filterableColumns: {
    email: [FilterOperator.ILIKE],
    firstName: [FilterOperator.ILIKE],
    lastName: [FilterOperator.ILIKE],
    provider: [FilterOperator.EQ],
    'role.id': [FilterOperator.EQ], // Allow filtering by role ID
    'status.id': [FilterOperator.EQ], // Allow filtering by status ID
    createdAt: [FilterOperator.BTW],
    updatedAt: [FilterOperator.BTW],
  },
  // Enable relations for filtering/sorting
  relations: ['role', 'status'],
};

// Pagination config for AudiobookProgress entity
export const progressPaginationConfig: PaginateConfig<AudiobookProgress> = {
  sortableColumns: ['updatedAt', 'time'], // Allow sorting by updatedAt and time
  defaultSortBy: [['updatedAt', 'DESC']], // Default sort by most recent update
  searchableColumns: ['bookId'], // Allow searching by bookId if needed
  // You can add relations here if you need to include book details, e.g., relations: ['book']
};
