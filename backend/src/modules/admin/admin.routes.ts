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
import { validate } from "../../middleware/validate.middleware";
import {
    addNoteSchema,
    respondTicketSchema,
    ticketIdOnlySchema,
    updateTicketSchema,
} from "../../validators/admin.validator";

const router = Router();

router.use(authMiddleware, authorizeRoles("admin"));

router.get("/tickets", getAllTickets);
router.get("/tickets/:ticketId", validate(ticketIdOnlySchema), getTicketById);
router.patch("/tickets/:ticketId", validate(updateTicketSchema), updateTicket);
router.post(
    "/tickets/:ticketId/assign",
    validate(ticketIdOnlySchema),
    assignTicketToSelf
);
router.post(
    "/tickets/:ticketId/notes",
    validate(addNoteSchema),
    addInternalNote
);
router.post(
    "/tickets/:ticketId/respond",
    validate(respondTicketSchema),
    respondToTicket
);
router.post(
    "/tickets/:ticketId/ai-draft",
    validate(ticketIdOnlySchema),
    generateAiDraftForTicket
);

export default router;
