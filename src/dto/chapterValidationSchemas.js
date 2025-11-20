import { z } from "zod";

// For: POST /api/books/:bookId/chapters (adding a new chapter)
export const addChapterSchema = z.object({
  title: z.string().min(1, "Chapter title is required"),
  content: z.string().min(1, "Chapter content is required"),
});

// For: PATCH /api/books/:bookId/chapters/:chapterNumber (updating a chapter)
export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

// For: POST /api/books/:bookId/chapters/reorder (reordering chapters)
export const reorderChaptersSchema = z.object({
  chapterOrder: z
    .array(z.number().int().positive())
    .min(1, "Chapter order must contain at least one chapter"),
});

