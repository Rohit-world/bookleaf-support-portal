export interface TicketAttachment {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  publicId?: string;
  resourceType?: string;
}

export interface TicketResponseItem {
  message: string;
  respondedBy?: string;
  createdAt?: string;
    sentAt?:string,
    sentByAdminId?:string
}

export interface TicketNoteItem {
  note: string;
  createdBy?: string;
  createdAt?: string;
  adminId?:string
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category?: string;
  aiCategory?: string;
  priority?: string;
  aiPriority?: string;
  aiCategoryReason?: string;
  aiPriorityReason?: string;
  aiDraftResponse?: string | null;
  status: string;
  attachments: TicketAttachment[];
  responses?: TicketResponseItem[];
  internalNotes?: TicketNoteItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTicketResponse {
  success: boolean;
  message: string;
  data: Ticket;
}

export interface TicketsResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}

export interface TicketDetailResponse {
  success: boolean;
  message: string;
  data: Ticket;
}
