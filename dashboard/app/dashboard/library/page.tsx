// Server Component for Library Page

"use client"

import { useState } from "react"
import LibraryFilterSheet from "@/components/library/LibraryFilterSheet"
import LibraryViewToggle from "@/components/library/LibraryViewToggle"
import LibrarySearchInput from "@/components/library/LibrarySearchInput"
import LibraryTabs from "@/components/library/LibraryTabs"
import { get, del } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

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

import { useEffect } from "react"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")
  const [durationRange, setDurationRange] = useState([0, 20])
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    get<{ data: Book[] }>("/books", { cache: "no-store" })
      .then((res) => {
        setBooks(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Errore nel caricamento dei libri")
        setLoading(false)
      })
  }, [])

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre

    const durationStr = book.duration ?? "0h"
    const bookDuration = Number.parseFloat(durationStr.split("h")[0])
    const matchesDuration = bookDuration >= durationRange[0] && bookDuration <= durationRange[1]

    return matchesSearch && matchesGenre && matchesDuration
  })

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title)
      case "author":
        return a.author.localeCompare(b.author)
      case "duration":
        return (Number.parseFloat(a.duration?.split("h")[0] ?? "0") - Number.parseFloat(b.duration?.split("h")[0] ?? "0"))
      default:
        return 0
    }
  })

  const deleteBook = async (bookId: string, bookTitle: string) => {
    setDeletingBookId(bookId)
    try {
      await del(`/books/${bookId}`)
      setBooks(books.filter(book => book.id !== bookId))
      toast({
        title: "Libro eliminato",
        description: `"${bookTitle}" è stato eliminato con successo.`,
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il libro. Riprova più tardi.",
        variant: "destructive",
      })
    } finally {
      setDeletingBookId(null)
    }
  }

  const genres = Array.from(new Set(books.map((book) => book.genre).filter(Boolean))) as string[]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">Browse and manage your audiobook collection.</p>
        </div>
        <div className="flex items-center gap-2">
          <LibraryFilterSheet
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            genres={genres}
            sortBy={sortBy}
            setSortBy={setSortBy}
            durationRange={durationRange}
            setDurationRange={setDurationRange}
          />
          <LibrarySearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <LibraryViewToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>
      <LibraryTabs
        loading={loading}
        error={error}
        viewMode={viewMode}
        sortedBooks={sortedBooks}
        deletingBookId={deletingBookId}
        onDelete={deleteBook}
      />
    </div>
  )
}
