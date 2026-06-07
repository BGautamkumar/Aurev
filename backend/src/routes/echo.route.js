import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getEchoScore, getLeaderboard } from "../controllers/echo.controller.js";

const router = express.Router();

router.get("/score", protectRoute, getEchoScore);
router.get("/leaderboard", protectRoute, getLeaderboard);

export default router;
