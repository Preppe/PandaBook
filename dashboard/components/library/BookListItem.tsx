// Rappresenta un singolo libro in formato lista

import React from "react"
import Image from "next/image"
import { BookEditDialog, ChapterEdit } from "./BookEditDialog"
import { updateBook } from "../../lib/api"
import { Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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

interface BookListItemProps {
  book: Book
  deletingBookId: string | null
  onDelete: (bookId: string, bookTitle: string) => void
}

export default function BookListItem({ book, deletingBookId, onDelete }: BookListItemProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [localBook, setLocalBook] = React.useState(book);

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
          ? localBook.cover // mantieni la cover originale se non aggiornata
          : (data.cover as string | undefined),
    });
    // TODO: refresh global state/lista se necessario
  };

  return (
    <>
      <Card>
        <div className="flex">
          <div className="relative h-24 w-16 flex-shrink-0">
            <Image
              src={localBook.cover || "/placeholder.svg"}
              alt={localBook.title}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{localBook.title}</h3>
                <p className="text-sm text-muted-foreground">{localBook.author}</p>
                <p className="text-xs text-muted-foreground mt-1">Narrator: {localBook.narrator}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm">{localBook.duration}</p>
                  <p className="text-xs text-muted-foreground mt-1">{localBook.genre}</p>
                  {localBook.isNew && (
                    <Badge className="mt-1 bg-redpanda-fur text-white">New</Badge>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} title="Modifica">
                  <Pencil size={16} />
                </Button>
                <span title="Elimina">
                  <DeleteBookDialog book={localBook} deletingBookId={deletingBookId} onDelete={onDelete} />
                </span>
              </div>
            </div>
          </CardContent>
        </div>
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
    </>
  );
}
