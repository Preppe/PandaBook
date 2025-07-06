import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChapterListEditor } from "./ChapterListEditor";

export interface ChapterEdit {
  id?: number;
  chapterNumber: number;
  description: string;
  startTime: number;
  endTime: number;
}

export interface BookEditDialogProps {
  open: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    description?: string;
    cover?: string;
    chapters: ChapterEdit[];
  };
  onSave: (data: {
    title: string;
    author: string;
    description?: string;
    cover?: File | null;
    chapters: ChapterEdit[];
  }) => Promise<void>;
}

export const BookEditDialog: React.FC<BookEditDialogProps> = ({
  open,
  onClose,
  book,
  onSave,
}) => {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description || "");
  const [cover, setCover] = useState<File | null>(null);
  const [chapters, setChapters] = useState<ChapterEdit[]>(book.chapters || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title,
        author,
        description,
        cover,
        chapters,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogTitle>Modifica libro</DialogTitle>
        <div className="space-y-2">
          <Input placeholder="Titolo" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Autore" value={author} onChange={e => setAuthor(e.target.value)} />
          <Input placeholder="Descrizione" value={description} onChange={e => setDescription(e.target.value)} />
          <Input
            type="file"
            accept="image/*"
            onChange={e => setCover(e.target.files?.[0] || null)}
          />
          <ChapterListEditor
            chapters={chapters}
            setChapters={setChapters}
          />
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose} disabled={saving}>Annulla</Button>
            <Button onClick={handleSave} disabled={saving} variant="default">
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
