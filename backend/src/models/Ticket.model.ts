import mongoose, { Document, Schema, Types } from "mongoose";

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketCategory =
  | "Royalty & Payments"
  | "ISBN & Metadata Issues"
  | "Printing & Quality"
  | "Distribution & Availability"
  | "Book Status & Production Updates"
  | "General Inquiry";

export type TicketPriority = "Critical" | "High" | "Medium" | "Low";

export interface ITicketResponse {
  message: string;
  sentByAdminId?: Types.ObjectId | null;
  sentAt: Date;
}

export interface ITicketInternalNote {
  note: string;
  adminId?: Types.ObjectId | null;
  createdAt: Date;
}

export interface ITicketAttachment {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
}

export interface ITicket extends Document {
  ticketNumber: string;
  authorMongoId: Types.ObjectId;
  bookMongoId?: Types.ObjectId | null;
  subject: string;
  description: string;
  category: TicketCategory;
  aiCategory?: TicketCategory | null;
  priority: TicketPriority;
  aiPriority?: TicketPriority | null;
  status: TicketStatus;
  assignedTo?: Types.ObjectId | null;
  responses: ITicketResponse[];
  internalNotes: ITicketInternalNote[];
  attachments: ITicketAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketResponseSchema = new Schema<ITicketResponse>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sentByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ticketInternalNoteSchema = new Schema<ITicketInternalNote>(
  {
    note: {
      type: String,
      required: true,
      trim: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ticketAttachmentSchema = new Schema<ITicketAttachment>(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    authorMongoId: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
      index: true,
    },
    bookMongoId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Royalty & Payments",
        "ISBN & Metadata Issues",
        "Printing & Quality",
        "Distribution & Availability",
        "Book Status & Production Updates",
        "General Inquiry",
      ],
      default: "General Inquiry",
      index: true,
    },
    aiCategory: {
      type: String,
      enum: [
        "Royalty & Payments",
        "ISBN & Metadata Issues",
        "Printing & Quality",
        "Distribution & Availability",
        "Book Status & Production Updates",
        "General Inquiry",
      ],
      default: null,
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    aiPriority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: null,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    responses: {
      type: [ticketResponseSchema],
      default: [],
    },
    internalNotes: {
      type: [ticketInternalNoteSchema],
      default: [],
    },
    attachments: {
      type: [ticketAttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
