// Gestisce la barra di ricerca della Library

import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface LibrarySearchInputProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function LibrarySearchInput({ searchQuery, setSearchQuery }: LibrarySearchInputProps) {
  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search library..."
        className="pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )
}
