// Rappresenta un singolo libro in formato griglia

import React, { useState } from "react"
import Image from "next/image"
import { BookEditDialog, ChapterEdit } from "./BookEditDialog"
import { updateBook } from "../../lib/api"
import { AudioDetailsDialog } from "./AudioDetailsDialog"
import { get } from "../../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Volume2 } from "lucide-react"
import DeleteBookDialog from "./DeleteBookDialog"

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

interface BookCardProps {
  book: Book
  deletingBookId: string | null
  onDelete: (bookId: string, bookTitle: string) => void
}

export default function BookCard({ book, deletingBookId, onDelete }: BookCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [localBook, setLocalBook] = useState(book);

  // Stato per dialog dettagli audio
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioMeta, setAudioMeta] = useState<any>(null);

  // Placeholder: fetch chapters/book details if needed
  const chapters: ChapterEdit[] = []; // Da popolare con i dati reali

  const handleSave = async (data: {
    title: string;
    author: string;
    description?: string;
    cover?: File | null;
    chapters: ChapterEdit[];
  }) => {
    await updateBook(localBook.id, data);
    setLocalBook({
      ...localBook,
      ...data,
      cover:
        data.cover && typeof data.cover !== "string"
          ? localBook.cover
          : (data.cover as string | undefined),
    });
    // TODO: refresh global state/lista se necessario
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-[3/4] w-full">
          <Image src={localBook.cover || "/placeholder.svg"} alt={localBook.title} fill className="object-cover" />
          {localBook.isNew && (
            <Badge className="absolute top-2 right-2 bg-redpanda-fur text-white">New</Badge>
          )}
        </div>
        <CardContent className="p-4 flex gap-3">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-1">{localBook.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{localBook.author}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{localBook.genre}</span>
              <span>{localBook.duration}</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} title="Modifica">
              <Pencil size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                setAudioDialogOpen(true);
                setAudioLoading(true);
                setAudioMeta(null);
                try {
                  const detail = await get(`/books/${localBook.id}`) as { audio?: any };
                  setAudioMeta(detail.audio || null);
                } catch {
                  setAudioMeta(null);
                }
                setAudioLoading(false);
              }}
              title="Dettagli audio"
            >
              <Volume2 size={16} />
            </Button>
            <span title="Elimina">
              <DeleteBookDialog book={localBook} deletingBookId={deletingBookId} onDelete={onDelete} />
            </span>
          </div>
        </CardContent>
      </Card>
      <BookEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        book={{
          ...localBook,
          chapters,
        }}
        onSave={handleSave}
      />
      <AudioDetailsDialog
        open={audioDialogOpen}
        onClose={() => setAudioDialogOpen(false)}
        audio={audioMeta}
        loading={audioLoading}
      />
    </>
  );
}
