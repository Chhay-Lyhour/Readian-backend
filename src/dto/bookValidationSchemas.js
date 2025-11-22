import { z } from "zod";

// For: POST /api/books (creating a new book)
export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  readingTime: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
  genre: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description cannot exceed 1000 characters").optional(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  image: z.string().optional(),
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  publishedDate: z.coerce.date().optional(),
  contentType: z.enum(["kids", "adult"]).default("kids"),
  chapters: z
    .array(
      z.object({
        title: z.string().min(1, "Chapter title is required"),
        content: z.string().min(1, "Chapter content is required"),
      })
    )
    .min(1, "At least one chapter is required"),
});

// For: PATCH /api/books/:id (updating a book)
export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  tags: z.string().optional(),
  genre: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description cannot exceed 1000 characters").optional(),
  rating: z.number().min(0).max(5).optional(),
  image: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  bookStatus: z.enum(["ongoing", "finished"]).optional(),
  isPremium: z.boolean().optional(),
  publishedDate: z.coerce.date().optional(),
  contentType: z.enum(["kids", "adult"]).optional(),
  chapters: z
    .array(
      z.object({
        title: z.string().min(1, "Chapter title is required"),
        content: z.string().min(1, "Chapter content is required"),
      })
    )
    .min(1, "At least one chapter is required")
    .optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const chapterPaginationQuerySchema = z.object({
  chapterPage: z.coerce.number().int().min(1).default(1),
  chapterLimit: z.coerce.number().int().min(1).max(100).default(10),
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

export const updateBookStatusSchema = z.object({
  bookStatus: z.enum(["ongoing", "finished"], {
    required_error: "Book status is required",
    invalid_type_error: "Book status must be 'ongoing' or 'finished'",
  }),
});

export const updateContentTypeSchema = z.object({
  contentType: z.enum(["kids", "adult"], {
    required_error: "Content type is required",
    invalid_type_error: "Content type must be 'kids' or 'adult'",
  }),
});

