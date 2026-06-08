import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAurevScore, getLeaderboard } from "../controllers/aurev.controller.js";

const router = express.Router();

router.get("/score", protectRoute, getAurevScore);
router.get("/leaderboard", protectRoute, getLeaderboard);

export default router;
