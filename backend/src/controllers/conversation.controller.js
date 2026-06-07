import Conversation from "../models/conversation.model.js";
import logger from "../lib/logger.js";

// Get all conversations for the current user (ordered: pinned first, then by last message)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { archived } = req.query;

    let query = { participants: userId };

    if (archived === "true") {
      query.archivedBy = userId;
    } else {
      query.archivedBy = { $ne: userId };
    }

    const conversations = await Conversation.find(query)
      .populate("participants", "fullName profilePic email")
      .populate("lastMessage.senderId", "fullName")
      .sort({ "lastMessage.createdAt": -1 })
      .lean();

    // Format response: add computed fields per user
    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      const unread = conv.unreadCount?.get?.(userId.toString()) || conv.unreadCount?.[userId.toString()] || 0;
      const isPinned = (conv.pinnedBy || []).some(
        (id) => id.toString() === userId.toString()
      );
      const isArchived = (conv.archivedBy || []).some(
        (id) => id.toString() === userId.toString()
      );

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: unread,
        isPinned,
        isArchived,
        updatedAt: conv.updatedAt,
      };
    });

    // Sort: pinned first, then by last message time
    formatted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0);
    });

    res.status(200).json(formatted);
  } catch (error) {
    logger.error("Error in getConversations", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle pin conversation
export const togglePinConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isPinned = conversation.pinnedBy.some(
      (pid) => pid.toString() === userId.toString()
    );

    if (isPinned) {
      conversation.pinnedBy.pull(userId);
    } else {
      conversation.pinnedBy.addToSet(userId);
    }

    await conversation.save();

    res.status(200).json({
      message: isPinned ? "Conversation unpinned" : "Conversation pinned",
      isPinned: !isPinned,
    });
  } catch (error) {
    logger.error("Error in togglePinConversation", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle archive conversation
export const toggleArchiveConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isArchived = conversation.archivedBy.some(
      (aid) => aid.toString() === userId.toString()
    );

    if (isArchived) {
      conversation.archivedBy.pull(userId);
    } else {
      conversation.archivedBy.addToSet(userId);
    }

    await conversation.save();

    res.status(200).json({
      message: isArchived ? "Conversation unarchived" : "Conversation archived",
      isArchived: !isArchived,
    });
  } catch (error) {
    logger.error("Error in toggleArchiveConversation", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark conversation as read
export const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await Conversation.findByIdAndUpdate(id, {
      $set: { [`unreadCount.${userId}`]: 0 },
    });

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    logger.error("Error in markConversationAsRead", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};
