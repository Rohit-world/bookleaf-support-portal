import { z } from "zod";

export const createTicketSchema = {
  body: z.object({
    bookId: z.string().trim().optional(),
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters")
      .max(150, "Subject cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters"),
  }),
};

export const ticketIdParamSchema = {
  params: z.object({
    ticketId: z.string().trim().min(1, "ticketId is required"),
  }),
};
