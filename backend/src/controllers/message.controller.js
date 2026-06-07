import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get only FRIENDS for sidebar (replaces the old "show everyone" approach)
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const user = await User.findById(loggedInUserId).populate(
      "friends",
      "fullName profilePic email"
    );

    res.status(200).json(user.friends || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const myId = req.user._id;

    // Check friendship — only friends can read messages
    const currentUser = await User.findById(myId);
    if (
      !currentUser.friends.some((fid) => fid.toString() === userToChatId) &&
      currentUser.privacy?.allowDMsFrom !== "everyone"
    ) {
      return res.status(403).json({ error: "You can only view messages with friends" });
    }

    // Check block
    if (currentUser.blockedUsers.some((bid) => bid.toString() === userToChatId)) {
      return res.status(403).json({ error: "This user is blocked" });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
    .populate("senderId", "fullName profilePic")
    .populate("receiverId", "fullName profilePic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Message.countDocuments({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // Mark conversation as read
    const conversation = await Conversation.findOne({
      participants: { $all: [myId, userToChatId] },
    });
    if (conversation) {
      conversation.unreadCount.set(myId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Check block in both directions
    const sender = await User.findById(senderId);
    if (
      sender.blockedUsers.some((bid) => bid.toString() === receiverId) ||
      receiver.blockedUsers.some((bid) => bid.toString() === senderId.toString())
    ) {
      return res.status(403).json({ error: "Cannot send message to this user" });
    }

    // DM permission check
    const areFriends = sender.friends.some((fid) => fid.toString() === receiverId);
    if (!areFriends && receiver.privacy?.allowDMsFrom === "friends") {
      return res.status(403).json({ error: "This user only accepts messages from friends" });
    }
    if (receiver.privacy?.allowDMsFrom === "nobody") {
      return res.status(403).json({ error: "This user has disabled direct messages" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl,
      status: "sent",
    });

    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic");
    await newMessage.populate("receiverId", "fullName profilePic");

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        lastMessage: {
          text: text?.trim() || (imageUrl ? "[Image]" : ""),
          senderId,
          createdAt: new Date(),
        },
        unreadCount: new Map([[receiverId.toString(), 1]]),
      });
    } else {
      conversation.lastMessage = {
        text: text?.trim() || (imageUrl ? "[Image]" : ""),
        senderId,
        createdAt: new Date(),
      };
      const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
      conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    }
    await conversation.save();

    // Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("conversation:updated", {
        conversationId: conversation._id,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount.get(receiverId.toString()),
      });
      await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });
    }

    // Emit conversation update to sender too
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("conversation:updated", {
        conversationId: conversation._id,
        lastMessage: conversation.lastMessage,
        unreadCount: 0,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
