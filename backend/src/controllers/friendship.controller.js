import User from "../models/user.model.js";
import Friendship from "../models/friendship.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import logger from "../lib/logger.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { userId } = req.params;

    // Cannot friend yourself
    if (requesterId.toString() === userId) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    // Check recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if blocked in either direction
    const requester = await User.findById(requesterId);
    if (requester.blockedUsers.includes(userId) || recipient.blockedUsers.includes(requesterId.toString())) {
      return res.status(403).json({ message: "Cannot send friend request" });
    }

    // Check for existing friendship record (in either direction)
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: userId },
        { requester: userId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      if (existing.status === "pending") {
        // If the OTHER person already sent us a request, auto-accept
        if (existing.requester.toString() === userId) {
          existing.status = "accepted";
          await existing.save();

          // Update both users' friends arrays
          await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: userId } });
          await User.findByIdAndUpdate(userId, { $addToSet: { friends: requesterId } });

          // Notify both users
          const receiverSocketId = getReceiverSocketId(userId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("friend:accepted", {
              userId: requesterId.toString(),
              user: { _id: requester._id, fullName: requester.fullName, profilePic: requester.profilePic },
            });
          }

          return res.status(200).json({ message: "Friend request accepted", status: "accepted" });
        }
        return res.status(400).json({ message: "Friend request already sent" });
      }
      if (existing.status === "declined") {
        // Allow re-sending after decline
        existing.status = "pending";
        existing.requester = requesterId;
        existing.recipient = userId;
        await existing.save();
      }
      if (existing.status === "blocked") {
        return res.status(403).json({ message: "Cannot send friend request" });
      }
    } else {
      // Create new friendship
      await Friendship.create({ requester: requesterId, recipient: userId, status: "pending" });
    }

    // Real-time notification
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friend:request", {
        userId: requesterId.toString(),
        user: { _id: requester._id, fullName: requester.fullName, profilePic: requester.profilePic },
      });
    }

    res.status(200).json({ message: "Friend request sent", status: "pending" });
  } catch (error) {
    logger.error("Error in sendFriendRequest", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const friendship = await Friendship.findOne({
      requester: userId,
      recipient: currentUserId,
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({ message: "No pending friend request found" });
    }

    friendship.status = "accepted";
    await friendship.save();

    // Update both users' friends arrays atomically
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: currentUserId } });

    const currentUser = await User.findById(currentUserId).select("fullName profilePic");

    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friend:accepted", {
        userId: currentUserId.toString(),
        user: { _id: currentUser._id, fullName: currentUser.fullName, profilePic: currentUser.profilePic },
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    logger.error("Error in acceptFriendRequest", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decline friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const friendship = await Friendship.findOne({
      requester: userId,
      recipient: currentUserId,
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({ message: "No pending friend request found" });
    }

    friendship.status = "declined";
    await friendship.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    logger.error("Error in declineFriendRequest", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove friend (unfriend)
export const removeFriend = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    // Remove friendship record
    await Friendship.findOneAndDelete({
      $or: [
        { requester: currentUserId, recipient: userId, status: "accepted" },
        { requester: userId, recipient: currentUserId, status: "accepted" },
      ],
    });

    // Remove from both users' friends arrays
    await User.findByIdAndUpdate(currentUserId, { $pull: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { friends: currentUserId } });

    // Notify the other user
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friend:removed", {
        userId: currentUserId.toString(),
      });
    }

    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    logger.error("Error in removeFriend", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    // Remove any existing friendship
    await Friendship.findOneAndDelete({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId },
      ],
    });

    // Create a blocked record
    await Friendship.create({
      requester: currentUserId,
      recipient: userId,
      status: "blocked",
      blockedBy: currentUserId,
    });

    // Remove from friends and add to blocked
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: userId },
      $addToSet: { blockedUsers: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: currentUserId },
    });

    // Notify
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friend:removed", {
        userId: currentUserId.toString(),
      });
    }

    res.status(200).json({ message: "User blocked" });
  } catch (error) {
    logger.error("Error in blockUser", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    await Friendship.findOneAndDelete({
      requester: currentUserId,
      recipient: userId,
      status: "blocked",
      blockedBy: currentUserId,
    });

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: userId },
    });

    res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    logger.error("Error in unblockUser", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "fullName profilePic email");
    res.status(200).json(user.friends || []);
  } catch (error) {
    logger.error("Error in getFriends", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending friend requests (received)
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Friendship.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "fullName profilePic email");

    const formatted = requests.map((r) => ({
      _id: r._id,
      user: r.requester,
      createdAt: r.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    logger.error("Error in getPendingRequests", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get sent requests
export const getSentRequests = async (req, res) => {
  try {
    const requests = await Friendship.find({
      requester: req.user._id,
      status: "pending",
    }).populate("recipient", "fullName profilePic email");

    const formatted = requests.map((r) => ({
      _id: r._id,
      user: r.recipient,
      createdAt: r.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    logger.error("Error in getSentRequests", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("blockedUsers", "fullName profilePic");
    res.status(200).json(user.blockedUsers || []);
  } catch (error) {
    logger.error("Error in getBlockedUsers", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users (for adding friends)
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;

    if (!q || q.trim().length < 2) {
      return res.status(200).json([]);
    }

    const currentUser = await User.findById(currentUserId);

    // Search by name or email (case-insensitive)
    const users = await User.find({
      _id: { $ne: currentUserId, $nin: currentUser.blockedUsers || [] },
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("fullName profilePic email")
      .limit(20);

    // Get friendship status for each result
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: users.map((u) => u._id) } },
        { requester: { $in: users.map((u) => u._id) }, recipient: currentUserId },
      ],
    });

    const results = users.map((user) => {
      const friendship = friendships.find(
        (f) =>
          (f.requester.toString() === user._id.toString() && f.recipient.toString() === currentUserId.toString()) ||
          (f.requester.toString() === currentUserId.toString() && f.recipient.toString() === user._id.toString())
      );

      let friendshipStatus = "none";
      let isRequestFromMe = false;

      if (friendship) {
        friendshipStatus = friendship.status;
        isRequestFromMe = friendship.requester.toString() === currentUserId.toString();
      }

      return {
        _id: user._id,
        fullName: user.fullName,
        profilePic: user.profilePic,
        email: user.email,
        friendshipStatus,
        isRequestFromMe,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    logger.error("Error in searchUsers", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};
