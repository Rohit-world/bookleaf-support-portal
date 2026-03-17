import multer from "multer";

const storage = multer.memoryStorage();

export const uploadTicketAttachments = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
}).array("attachments", 5);
