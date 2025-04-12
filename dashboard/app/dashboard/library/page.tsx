"use client"

import { useState } from "react"
import { BookOpen, Grid, List, Search, SlidersHorizontal } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

// Sample audiobook data
const audiobooks = [
  {
    id: 1,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    narrator: "Jack Hawkins, Louise Brealey",
    duration: "8h 43m",
    genre: "Thriller",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 75,
    isNew: true,
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    narrator: "James Clear",
    duration: "5h 35m",
    genre: "Self-Development",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 100,
    isNew: false,
  },
  {
    id: 3,
    title: "Project Hail Mary",
    author: "Andy Weir",
    narrator: "Ray Porter",
    duration: "16h 10m",
    genre: "Sci-Fi",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 30,
    isNew: true,
  },
  {
    id: 4,
    title: "The Midnight Library",
    author: "Matt Haig",
    narrator: "Carey Mulligan",
    duration: "8h 50m",
    genre: "Fiction",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 0,
    isNew: false,
  },
  {
    id: 5,
    title: "Educated",
    author: "Tara Westover",
    narrator: "Julia Whelan",
    duration: "12h 10m",
    genre: "Memoir",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 60,
    isNew: false,
  },
  {
    id: 6,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    narrator: "Derek Perkins",
    duration: "15h 17m",
    genre: "Non-Fiction",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 45,
    isNew: false,
  },
  {
    id: 7,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    narrator: "Chris Hill",
    duration: "5h 48m",
    genre: "Finance",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 0,
    isNew: true,
  },
  {
    id: 8,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    narrator: "Cassandra Campbell",
    duration: "12h 12m",
    genre: "Fiction",
    coverImage: "/placeholder.svg?height=400&width=300",
    progress: 10,
    isNew: false,
  },
]

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")
  const [showCompleted, setShowCompleted] = useState(true)
  const [showInProgress, setShowInProgress] = useState(true)
  const [showNotStarted, setShowNotStarted] = useState(true)
  const [durationRange, setDurationRange] = useState([0, 20])

  // Filter audiobooks based on search query, genre, and progress filters
  const filteredAudiobooks = audiobooks.filter((book) => {
    // Search filter
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())

    // Genre filter
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre

    // Progress filter
    const matchesProgress =
      (showCompleted && book.progress === 100) ||
      (showInProgress && book.progress > 0 && book.progress < 100) ||
      (showNotStarted && book.progress === 0)

    // Duration filter (convert hours to numeric value for comparison)
    const bookDuration = Number.parseFloat(book.duration.split("h")[0])
    const matchesDuration = bookDuration >= durationRange[0] && bookDuration <= durationRange[1]

    return matchesSearch && matchesGenre && matchesProgress && matchesDuration
  })

  // Sort audiobooks
  const sortedAudiobooks = [...filteredAudiobooks].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title)
      case "author":
        return a.author.localeCompare(b.author)
      case "duration":
        return Number.parseFloat(a.duration.split("h")[0]) - Number.parseFloat(b.duration.split("h")[0])
      case "progress":
        return b.progress - a.progress
      default:
        return 0
    }
  })

  // Get unique genres for filter dropdown
  const genres = Array.from(new Set(audiobooks.map((book) => book.genre)))

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">Browse and manage your audiobook collection.</p>
        </div>
        <div className="flex items-center gap-2">
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

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Progress</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="completed" className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      Completed
                    </Label>
                    <Switch id="completed" checked={showCompleted} onCheckedChange={setShowCompleted} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-progress" className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      In Progress
                    </Label>
                    <Switch id="in-progress" checked={showInProgress} onCheckedChange={setShowInProgress} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="not-started" className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      Not Started
                    </Label>
                    <Switch id="not-started" checked={showNotStarted} onCheckedChange={setShowNotStarted} />
                  </div>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

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

          <div className="border rounded-md flex">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Books</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {sortedAudiobooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No audiobooks found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedAudiobooks.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="relative aspect-[3/4] w-full">
                    <Image src={book.coverImage || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                    <Badge className="absolute top-2 right-2 bg-redpanda-fur text-white">New</Badge>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                      <div
                        className={`h-full ${
                          book.progress === 100 ? "bg-redpanda-forest" : book.progress > 0 ? "bg-redpanda-amber" : ""
                        }`}
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{book.genre}</span>
                      <span>{book.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAudiobooks.map((book) => (
                <Card key={book.id}>
                  <div className="flex">
                    <div className="relative h-24 w-16 flex-shrink-0">
                      <Image
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          <p className="text-xs text-muted-foreground mt-1">Narrator: {book.narrator}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{book.duration}</p>
                          <p className="text-xs text-muted-foreground mt-1">{book.genre}</p>
                          <Badge className="mt-1 bg-redpanda-fur text-white">New</Badge>
                        </div>
                      </div>
                      <div className="mt-2 h-1 w-full bg-muted">
                        <div
                          className={`h-full ${
                            book.progress === 100 ? "bg-redpanda-forest" : book.progress > 0 ? "bg-redpanda-amber" : ""
                          }`}
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-right text-muted-foreground">{book.progress}% complete</div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedAudiobooks
                .filter((book) => book.progress > 0 && book.progress < 100)
                .map((book) => (
                  <Card key={book.id} className="overflow-hidden">
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                        <div className="h-full bg-amber-500" style={{ width: `${book.progress}%` }} />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{book.genre}</span>
                        <span>{book.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAudiobooks
                .filter((book) => book.progress > 0 && book.progress < 100)
                .map((book) => (
                  <Card key={book.id}>
                    <div className="flex">
                      <div className="relative h-24 w-16 flex-shrink-0">
                        <Image
                          src={book.coverImage || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <p className="text-xs text-muted-foreground mt-1">Narrator: {book.narrator}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{book.duration}</p>
                            <p className="text-xs text-muted-foreground mt-1">{book.genre}</p>
                          </div>
                        </div>
                        <div className="mt-2 h-1 w-full bg-muted">
                          <div className="h-full bg-amber-500" style={{ width: `${book.progress}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-right text-muted-foreground">{book.progress}% complete</div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedAudiobooks
                .filter((book) => book.isNew)
                .map((book) => (
                  <Card key={book.id} className="overflow-hidden">
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-redpanda-fur text-white">New</Badge>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                        <div
                          className={`h-full ${
                            book.progress === 100 ? "bg-redpanda-forest" : book.progress > 0 ? "bg-redpanda-amber" : ""
                          }`}
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{book.genre}</span>
                        <span>{book.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAudiobooks
                .filter((book) => book.isNew)
                .map((book) => (
                  <Card key={book.id}>
                    <div className="flex">
                      <div className="relative h-24 w-16 flex-shrink-0">
                        <Image
                          src={book.coverImage || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <p className="text-xs text-muted-foreground mt-1">Narrator: {book.narrator}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{book.duration}</p>
                            <p className="text-xs text-muted-foreground mt-1">{book.genre}</p>
                            <Badge className="mt-1 bg-redpanda-fur text-white">New</Badge>
                          </div>
                        </div>
                        <div className="mt-2 h-1 w-full bg-muted">
                          <div
                            className={`h-full ${
                              book.progress === 100
                                ? "bg-redpanda-forest"
                                : book.progress > 0
                                  ? "bg-redpanda-amber"
                                  : ""
                            }`}
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-right text-muted-foreground">{book.progress}% complete</div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

