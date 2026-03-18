import { Router } from "express";
import {
  createSupportTicket,
  getMyBooks,
  getMyTicketById,
  getMyTickets,
} from "./author.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { uploadTicketAttachments } from "../../middleware/upload.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createTicketSchema,
  ticketIdParamSchema,
} from "../../validators/author.validator";

const router = Router();

router.use(authMiddleware, authorizeRoles("author"));

router.get("/books", getMyBooks);
router.get("/tickets", getMyTickets);
router.get("/tickets/:ticketId", validate(ticketIdParamSchema), getMyTicketById);
router.post(
  "/tickets",
  uploadTicketAttachments,
  validate(createTicketSchema),
  createSupportTicket
);

export default router;
