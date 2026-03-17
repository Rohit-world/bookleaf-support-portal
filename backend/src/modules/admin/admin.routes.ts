import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import {
  addInternalNote,
  assignTicketToSelf,
  generateAiDraftForTicket,
  getAllTickets,
  getTicketById,
  respondToTicket,
  updateTicket,
} from "./admin.controller";


const router = Router();

router.use(authMiddleware, authorizeRoles("admin"));
router.get("/tickets", getAllTickets);
router.get("/tickets/:ticketId", getTicketById);
router.patch("/tickets/:ticketId", updateTicket);
router.post("/tickets/:ticketId/assign", assignTicketToSelf);
router.post("/tickets/:ticketId/notes", addInternalNote);
router.post("/tickets/:ticketId/respond", respondToTicket);
router.post("/tickets/:ticketId/ai-draft", generateAiDraftForTicket);


export default router;
