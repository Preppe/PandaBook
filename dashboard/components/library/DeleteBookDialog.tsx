// Dialog di conferma per l'eliminazione di un libro

import React from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

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

interface DeleteBookDialogProps {
  book: Book
  deletingBookId: string | null
  onDelete: (bookId: string, bookTitle: string) => void
}

export default function DeleteBookDialog({ book, deletingBookId, onDelete }: DeleteBookDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          disabled={deletingBookId === book.id}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare il libro?</AlertDialogTitle>
          <AlertDialogDescription>
            Questa azione non può essere annullata. Il libro "{book.title}" verrà eliminato permanentemente dal sistema, inclusi tutti i file associati.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(book.id, book.title)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletingBookId === book.id ? "Eliminando..." : "Elimina"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
