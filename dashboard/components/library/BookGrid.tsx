// Visualizza i libri in formato griglia

import React from "react"
import BookCard from "./BookCard"

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

interface BookGridProps {
  books: Book[]
  deletingBookId: string | null
  onDelete: (bookId: string, bookTitle: string) => void
}

export default function BookGrid({ books, deletingBookId, onDelete }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          deletingBookId={deletingBookId}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
