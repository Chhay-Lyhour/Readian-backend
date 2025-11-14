import { z } from "zod";

export const createChapterSchema = z.object({
  chapterNumber: z.number().int().positive("Chapter number must be a positive integer"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  isPremium: z.boolean().optional(),
});

export const updateChapterSchema = z.object({
  chapterNumber: z.number().int().positive("Chapter number must be a positive integer").optional(),
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  isPremium: z.boolean().optional(),
});
