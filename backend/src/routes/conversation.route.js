import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getConversations,
  togglePinConversation,
  toggleArchiveConversation,
  markConversationAsRead,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", protectRoute, getConversations);
router.put("/:id/pin", protectRoute, togglePinConversation);
router.put("/:id/archive", protectRoute, toggleArchiveConversation);
router.put("/:id/read", protectRoute, markConversationAsRead);

export default router;
