// Gestisce i tab e il rendering dei libri nella Library

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen } from "lucide-react"
import BookGrid from "./BookGrid"
import BookList from "./BookList"

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

interface LibraryTabsProps {
  loading: boolean
  error: string | null
  viewMode: "grid" | "list"
  sortedBooks: Book[]
  deletingBookId: string | null
  onDelete: (bookId: string, bookTitle: string) => void
}

export default function LibraryTabs({
  loading,
  error,
  viewMode,
  sortedBooks,
  deletingBookId,
  onDelete,
}: LibraryTabsProps) {
  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList>
        <TabsTrigger value="all">All Books</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="new">New</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Loading audiobooks...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Errore: {error}</h3>
          </div>
        ) : sortedBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No audiobooks found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        ) : viewMode === "grid" ? (
          <BookGrid
            books={sortedBooks}
            deletingBookId={deletingBookId}
            onDelete={onDelete}
          />
        ) : (
          <BookList
            books={sortedBooks}
            deletingBookId={deletingBookId}
            onDelete={onDelete}
          />
        )}
      </TabsContent>

      <TabsContent value="in-progress">
        {viewMode === "grid" ? (
          <BookGrid
            books={sortedBooks.filter((book) => (book.progress ?? 0) > 0 && (book.progress ?? 0) < 100)}
            deletingBookId={deletingBookId}
            onDelete={onDelete}
          />
        ) : (
          <BookList
            books={sortedBooks.filter((book) => (book.progress ?? 0) > 0 && (book.progress ?? 0) < 100)}
            deletingBookId={deletingBookId}
            onDelete={onDelete}
          />
        )}
      </TabsContent>

      <TabsContent value="new">
        {viewMode === "grid" ? (
          <BookGrid
            books={sortedBooks.filter((book) => book.isNew)}
            deletingBookId={deletingBookId}
            onDelete={onDelete}
          />
        ) : (
          <BookList
            books={sortedBooks.filter((book) => book.isNew)}
            deletingBookId={deletingBookId}
            onDelete={onDelete}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
