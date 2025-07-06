// Visualizza i libri in formato lista

import React from "react"
import BookListItem from "./BookListItem"

type Book = {
  id: string
  title: string
  author: string
  narrator?: string
  duration?: string
  genre?: string
  cover?: string
  progress?: number
  isNew?: boolean
}

interface BookListProps {
  books: Book[]
  deletingBookId: string | null
  onDelete: (bookId: string, bookTitle: string) => void
}

export default function BookList({ books, deletingBookId, onDelete }: BookListProps) {
  return (
    <div className="space-y-4">
      {books.map((book) => (
        <BookListItem
          key={book.id}
          book={book}
          deletingBookId={deletingBookId}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
