import { Response } from "express";
import mongoose from "mongoose";
import Ticket from "../../models/Ticket.model";
import Admin from "../../models/Admin.model";
import { AuthRequest } from "../../middleware/auth.middleware";
import Author from "../../models/Author.model";
import Book from "../../models/Book.model";
import { draftResponseAI } from "../../services/ai.service";
import { sendSseEventToRole, sendSseEventToUser } from "../../services/sse.service";
import User from "../../models/User.model";



export async function getAllTickets(req: AuthRequest, res: Response) {
    try {
        const { status, category, priority, dateFrom, dateTo } = req.query;

        const filter: any = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(String(dateFrom));
            if (dateTo) filter.createdAt.$lte = new Date(String(dateTo));
        }

        const tickets = await Ticket.find(filter)
            .populate("authorMongoId", "name email authorId city")
            .populate("bookMongoId", "title bookId status")
            .populate("assignedTo", "name email")
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch tickets",
        });
    }
}

export async function getTicketById(req: AuthRequest, res: Response) {
    try {
        const { ticketId } = req.params;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticketId format",
            });
        }

        const ticket = await Ticket.findById(ticketId)
            .populate("authorMongoId", "name email authorId city phone")
            .populate("bookMongoId", "title bookId status isbn genre")
            .populate("assignedTo", "name email")
            .lean();

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch ticket details",
        });
    }
}

export async function updateTicket(req: AuthRequest, res: Response) {
    try {
        const { ticketId } = req.params;
        const { status, category, priority } = req.body;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticketId format",
            });
        }

        const updateData: any = {};

        if (status) updateData.status = status;
        if (category) updateData.category = category;
        if (priority) updateData.priority = priority;

        const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updateData, {
            new: true,
        })
            .populate("authorMongoId", "name email authorId")
            .populate("bookMongoId", "title bookId")
            .populate("assignedTo", "name email")
            .lean();

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

            const author = await Author.findById(updatedTicket?.authorMongoId).lean();
    const authorUser = author
      ? await User.findById(author.userId).lean()
      : null;

    if (authorUser) {
      sendSseEventToUser(authorUser._id.toString(), "ticket_updated", {
        ticketId: updatedTicket?._id,
        type: "status_changed",
        status: updatedTicket?.status,
      });
    }

    sendSseEventToRole("admin", "admin_ticket_updated", {
      ticketId: updatedTicket?._id,
      type: "status_changed",
      status: updatedTicket?.status,
    });


        return res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            data: updatedTicket,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update ticket",
        });
    }
}

export async function assignTicketToSelf(req: AuthRequest, res: Response) {
    try {
        const { ticketId } = req.params;
        const userId = req.user?.userId;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticketId format",
            });
        }

        const admin = await Admin.findOne({ userId }).lean();

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin profile not found",
            });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { assignedTo: admin._id },
            { new: true }
        )
            .populate("authorMongoId", "name email authorId")
            .populate("bookMongoId", "title bookId")
            .populate("assignedTo", "name email")
            .lean();

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }
    sendSseEventToRole("admin", "admin_ticket_updated", {
      ticketId: updatedTicket?._id,
      type: "assignment_changed",
    });

        return res.status(200).json({
            success: true,
            message: "Ticket assigned successfully",
            data: updatedTicket,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to assign ticket",
        });
    }
}

export async function addInternalNote(req: AuthRequest, res: Response) {
    try {
        const { ticketId } = req.params;
        const { note } = req.body;
        const userId = req.user?.userId;

        if (!note) {
            return res.status(400).json({
                success: false,
                message: "Note is required",
            });
        }

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticketId format",
            });
        }

        const admin = await Admin.findOne({ userId }).lean();

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin profile not found",
            });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                $push: {
                    internalNotes: {
                        note,
                        adminId: admin._id,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        ).lean();

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Internal note added successfully",
            data: updatedTicket,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add internal note",
        });
    }
}

export async function respondToTicket(req: AuthRequest, res: Response) {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;
        const userId = req.user?.userId;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Response message is required",
            });
        }

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticketId format",
            });
        }

        const admin = await Admin.findOne({ userId }).lean();

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin profile not found",
            });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                $push: {
                    responses: {
                        message,
                        sentByAdminId: admin._id,
                        sentAt: new Date(),
                    },
                },
                $set: {
                    status: "In Progress",
                },
            },
            { new: true }
        )
            .populate("authorMongoId", "name email authorId")
            .populate("bookMongoId", "title bookId")
            .populate("assignedTo", "name email")
            .lean();

        if (!updatedTicket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        const author = await Author.findById(updatedTicket?.authorMongoId).lean();
        const authorUser = author
            ? await User.findById(author.userId).lean()
            : null;

        if (authorUser) {
            sendSseEventToUser(authorUser._id.toString(), "ticket_updated", {
                ticketId: updatedTicket?._id,
                type: "response_added",
                message: "A new admin response was added to your ticket",
            });
        }

        sendSseEventToRole("admin", "admin_ticket_updated", {
            ticketId: updatedTicket?._id,
            type: "response_added",
        });


        return res.status(200).json({
            success: true,
            message: "Response sent successfully",
            data: updatedTicket,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send response",
        });
    }
}


export async function generateAiDraftForTicket(req: AuthRequest, res: Response) {
    try {
        const { ticketId } = req.params;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticketId format",
            });
        }

        const ticket = await Ticket.findById(ticketId).lean();

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            });
        }

        const author = await Author.findById(ticket.authorMongoId).lean();
        const book = ticket.bookMongoId
            ? await Book.findById(ticket.bookMongoId).lean()
            : null;

        const aiDraft = await draftResponseAI({
            subject: ticket.subject,
            description: ticket.description,
            category: ticket.category,
            priority: ticket.priority,
            authorName: author?.name,
            bookTitle: book?.title,
            bookStatus: book?.status,
            royaltyPending: book?.royaltyPending,
            lastRoyaltyPayoutDate: book?.lastRoyaltyPayoutDate
                ? new Date(book.lastRoyaltyPayoutDate).toISOString()
                : null,
        });

        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                aiDraftResponse: aiDraft.draft,
            },
            { new: true }
        )
            .populate("authorMongoId", "name email authorId")
            .populate("bookMongoId", "title bookId status isbn")
            .populate("assignedTo", "name email")
            .lean();

            
    sendSseEventToRole("admin", "admin_ticket_updated", {
      ticketId: updatedTicket?._id,
      type: "ai_draft_generated",
    });


        return res.status(200).json({
            success: true,
            message: "AI draft generated successfully",
            data: updatedTicket,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate AI draft",
        });
    }
}
