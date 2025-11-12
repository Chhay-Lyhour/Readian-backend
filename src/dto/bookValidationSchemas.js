import { z } from "zod";

// For: POST /api/books (creating a new book)
export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  chapter: z.number().int().min(0).optional(),
  tableOfContents: z.string().optional(),
  readingTime: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
  genre: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  image: z.string().optional(),
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  publishedDate: z.coerce.date().optional(),
  description: z.string().optional(),
});

// For: PATCH /api/books/:id (updating a book)
export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  chapter: z.number().int().min(0).optional(),
  tableOfContents: z.string().optional(),
  readingTime: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
  genre: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  image: z.string().optional(),
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  publishedDate: z.coerce.date().optional(),
  description: z.string().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const searchBookSchema = z
  .object({
    title: z.string().optional(),
    author: z.string().optional(),
    genre: z.string().optional(),
    tags: z.string().optional(),
    sortByLikes: z.enum(["asc", "desc"]).optional(),
  })
  .merge(paginationQuerySchema);
