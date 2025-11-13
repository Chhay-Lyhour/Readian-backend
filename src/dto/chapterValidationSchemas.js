import { z } from "zod";

export const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  chapterNumber: z.number().int().positive("Chapter number must be a positive integer"),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  chapterNumber: z.number().int().positive("Chapter number must be a positive integer").optional(),
});
