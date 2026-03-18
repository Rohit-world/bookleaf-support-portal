import { z } from "zod";

export const updateTicketSchema = {
  params: z.object({
    ticketId: z.string().trim().min(1, "ticketId is required"),
  }),
  body: z.object({
    status: z
      .enum(["Open", "In Progress", "Resolved", "Closed"])
      .optional(),
    category: z
      .enum([
        "Royalty & Payments",
        "ISBN & Metadata Issues",
        "Printing & Quality",
        "Distribution & Availability",
        "Book Status & Production Updates",
        "General Inquiry",
      ])
      .optional(),
    priority: z.enum(["Critical", "High", "Medium", "Low"]).optional(),
  }),
};

export const ticketIdOnlySchema = {
  params: z.object({
    ticketId: z.string().trim().min(1, "ticketId is required"),
  }),
};

export const addNoteSchema = {
  params: z.object({
    ticketId: z.string().trim().min(1, "ticketId is required"),
  }),
  body: z.object({
    note: z
      .string()
      .trim()
      .min(3, "Note must be at least 3 characters")
      .max(1000, "Note cannot exceed 1000 characters"),
  }),
};

export const respondTicketSchema = {
  params: z.object({
    ticketId: z.string().trim().min(1, "ticketId is required"),
  }),
  body: z.object({
    message: z
      .string()
      .trim()
      .min(3, "Response message must be at least 3 characters")
      .max(3000, "Response message cannot exceed 3000 characters"),
  }),
};
