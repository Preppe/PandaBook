import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChapterEdit } from "./BookEditDialog";

interface ChapterListEditorProps {
  chapters: ChapterEdit[];
  setChapters: (chapters: ChapterEdit[]) => void;
}

export const ChapterListEditor: React.FC<ChapterListEditorProps> = ({
  chapters,
  setChapters,
}) => {
  // Drag & drop handlers
  const onDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData("chapter-index", index.toString());
  };
  const onDrop = (index: number) => (e: React.DragEvent) => {
    const from = parseInt(e.dataTransfer.getData("chapter-index"), 10);
    if (from === index) return;
    const updated = [...chapters];
    const [moved] = updated.splice(from, 1);
    updated.splice(index, 0, moved);
    setChapters(updated.map((c, i) => ({ ...c, chapterNumber: i + 1 })));
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  // Move up/down
  const move = (from: number, to: number) => {
    if (to < 0 || to >= chapters.length) return;
    const updated = [...chapters];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setChapters(updated.map((c, i) => ({ ...c, chapterNumber: i + 1 })));
  };

  // Edit field
  const edit = (idx: number, field: keyof ChapterEdit, value: any) => {
    const updated = chapters.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    );
    setChapters(updated);
  };

  // Add chapter
  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        chapterNumber: chapters.length + 1,
        description: "",
        startTime: 0,
        endTime: 0,
      },
    ]);
  };

  // Remove chapter
  const removeChapter = (idx: number) => {
    const updated = chapters.filter((_, i) => i !== idx);
    setChapters(updated.map((c, i) => ({ ...c, chapterNumber: i + 1 })));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Capitoli</span>
        <Button size="sm" onClick={addChapter}>Aggiungi capitolo</Button>
      </div>
      <div>
        {chapters.map((chapter, idx) => (
          <div
            key={chapter.id ?? idx}
            className="flex items-center gap-2 mb-2 border p-2 rounded"
            draggable
            onDragStart={onDragStart(idx)}
            onDrop={onDrop(idx)}
            onDragOver={onDragOver}
          >
            <span className="w-6 text-center cursor-move">≡</span>
            <Input
              type="number"
              value={chapter.chapterNumber}
              style={{ width: 50 }}
              onChange={e => edit(idx, "chapterNumber", Number(e.target.value))}
              placeholder="N."
            />
            <Input
              value={chapter.description}
              onChange={e => edit(idx, "description", e.target.value)}
              placeholder="Descrizione"
            />
            <Input
              type="number"
              value={chapter.startTime}
              style={{ width: 80 }}
              onChange={e => edit(idx, "startTime", Number(e.target.value))}
              placeholder="Start"
            />
            <Input
              type="number"
              value={chapter.endTime}
              style={{ width: 80 }}
              onChange={e => edit(idx, "endTime", Number(e.target.value))}
              placeholder="End"
            />
            <Button size="sm" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>↑</Button>
            <Button size="sm" onClick={() => move(idx, idx + 1)} disabled={idx === chapters.length - 1}>↓</Button>
            <Button size="sm" variant="destructive" onClick={() => removeChapter(idx)}>Elimina</Button>
          </div>
        ))}
      </div>
    </div>
  );
};
