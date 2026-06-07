import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getBlockedUsers,
  searchUsers,
} from "../controllers/friendship.controller.js";

const router = express.Router();

// Friend request flow
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.put("/accept/:userId", protectRoute, acceptFriendRequest);
router.put("/decline/:userId", protectRoute, declineFriendRequest);
router.delete("/remove/:userId", protectRoute, removeFriend);

// Block/unblock
router.post("/block/:userId", protectRoute, blockUser);
router.delete("/unblock/:userId", protectRoute, unblockUser);

// Lists
router.get("/", protectRoute, getFriends);
router.get("/requests", protectRoute, getPendingRequests);
router.get("/sent", protectRoute, getSentRequests);
router.get("/blocked", protectRoute, getBlockedUsers);

// Search
router.get("/search", protectRoute, searchUsers);

export default router;
