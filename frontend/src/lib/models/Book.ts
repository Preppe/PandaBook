import type { Audio } from "./Audio";
import type { Chapter } from "./Chapter";

export interface Book {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  author: string;
  description?: string | null;
  narrator?: string | null;
  cover?: string | null;
  audio?: Audio | null;
  audioId?: string | null;
  chapters?: Chapter[];
}