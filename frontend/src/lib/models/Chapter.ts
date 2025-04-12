import { Book } from "./Book";

export interface Chapter {
  id: number;
  chapterNumber: number;
  description: string;
  startTime: number;
  endTime: number;
  book?: Book; // Optional to avoid circular dependency
}