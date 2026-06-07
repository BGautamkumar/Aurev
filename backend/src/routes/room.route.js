import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getRooms, createRoom, getRoomMessages } from "../controllers/room.controller.js";

const router = express.Router();

router.get("/", protectRoute, getRooms);
router.post("/", protectRoute, createRoom);
router.get("/:roomId/channels/:channelId/messages", protectRoute, getRoomMessages);

export default router;
