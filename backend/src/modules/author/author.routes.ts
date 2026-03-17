import { Router } from "express";
import {
  createSupportTicket,
  getMyBooks,
  getMyTicketById,
  getMyTickets,
} from "./author.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

router.use(authMiddleware, authorizeRoles("author"));

router.get("/books", getMyBooks);
router.get("/tickets", getMyTickets);
router.get("/tickets/:ticketId", getMyTicketById);
router.post("/tickets", createSupportTicket);

export default router;
