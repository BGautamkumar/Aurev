import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import { validate, validateParams, schemas } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, validateParams(schemas.message.getMessages), getMessages);

router.post("/send/:id", protectRoute, validate(schemas.message.send), sendMessage);

export default router;
