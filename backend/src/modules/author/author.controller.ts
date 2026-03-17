import mongoose from "mongoose";
import { Request, Response } from "express";
import Author from "../../models/Author.model";
import Book from "../../models/Book.model";
import Ticket from "../../models/Ticket.model";
import { AuthRequest } from "../../middleware/auth.middleware";
import { saveAttachments } from "../../utils/saveAttachment";

import {
    classifyTicketAI,
    scorePriorityAI,
} from "../../services/ai.service";


function generateTicketNumber() {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `TKT-${Date.now()}-${randomPart}`;
}

export async function getMyBooks(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.userId;

        const author = await Author.findOne({ userId }).lean();

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author profile not found",
            });
        }

        const books = await Book.find({ authorMongoId: author._id })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: books,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch books",
        });
    }
}

export async function createSupportTicket(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.userId;
        const { bookId, subject, description } = req.body;

        if (!subject || !description) {
            return res.status(400).json({
                success: false,
                message: "Subject and description are required",
            });
        }

        const author = await Author.findOne({ userId }).lean();

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author profile not found",
            });
        }

        let linkedBook = null;

        if (bookId && bookId !== "GENERAL") {
            if (!mongoose.isValidObjectId(bookId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid bookId format",
                });
            }

            linkedBook = await Book.findOne({
                _id: bookId,
                authorMongoId: author._id,
            }).lean();

            if (!linkedBook) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid book selected",
                });
            }
        }

        const aiCategoryResult = await classifyTicketAI({
            subject,
            description,
        });

        const aiPriorityResult = await scorePriorityAI({
            subject,
            description,
            category: aiCategoryResult.category,
        });

        const files = (req.files as Express.Multer.File[]) || [];
        const attachments = files.length ? await saveAttachments(files) : [];


        const ticket = await Ticket.create({
            ticketNumber: generateTicketNumber(),
            authorMongoId: author._id,
            bookMongoId: linkedBook?._id || null,
            subject,
            description,
            category: aiCategoryResult.category || "General Inquiry",
            aiCategory: aiCategoryResult.category || "General Inquiry",
            aiCategoryReason: aiCategoryResult.reason || null,
            priority: aiPriorityResult.priority || "Medium",
            aiPriority: aiPriorityResult.priority || "Medium",
            aiPriorityReason: aiPriorityResult.reason || null,
            aiDraftResponse: null,
            status: "Open",
            assignedTo: null,
            responses: [],
            internalNotes: [],
            attachments,


    });

    return res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        data: ticket,
    });
} catch (error: any) {
    return res.status(500).json({
        success: false,
        message: error.message || "Failed to create ticket",
    });
}
}

export async function getMyTickets(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.userId;

        const author = await Author.findOne({ userId }).lean();

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author profile not found",
            });
        }

        const tickets = await Ticket.find({ authorMongoId: author._id })
            .populate("bookMongoId", "title bookId status")
            .sort({ createdAt: -1 })
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

export async function getMyTicketById(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.userId;
        const { ticketId } = req.params;

        const author = await Author.findOne({ userId }).lean();

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author profile not found",
            });
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            authorMongoId: author._id,
        })
            .populate("bookMongoId", "title bookId status isbn")
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


