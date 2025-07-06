// Gestisce il pannello laterale dei filtri per la Library

import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { SlidersHorizontal } from "lucide-react"

interface LibraryFilterSheetProps {
  selectedGenre: string
  setSelectedGenre: (genre: string) => void
  genres: string[]
  sortBy: string
  setSortBy: (sort: string) => void
  durationRange: number[]
  setDurationRange: (range: number[]) => void
}

export default function LibraryFilterSheet({
  selectedGenre,
  setSelectedGenre,
  genres,
  sortBy,
  setSortBy,
  durationRange,
  setDurationRange,
}: LibraryFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Audiobooks</SheetTitle>
          <SheetDescription>Customize your library view with these filters.</SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Genre</h3>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sort By</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Duration (hours)</h3>
            <div className="pt-4">
              <Slider value={durationRange} min={0} max={20} step={1} onValueChange={setDurationRange} />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{durationRange[0]}h</span>
                <span>{durationRange[1]}h+</span>
              </div>
            </div>
          </div>

          <Separator />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
