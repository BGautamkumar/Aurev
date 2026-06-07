import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import logger from "../lib/logger.js";
import sanitizeHtml from "sanitize-html";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users and their socket IDs
const userSocketMap = {}; // {userId: socketId}
const typingUsers = new Set(); // Set of userIds currently typing
const userStatuses = new Map(); // Map of userId -> status data
const messageRateMap = new Map(); // Map of userId -> message timestamps for rate limiting
const clientMessageMap = new Map(); // Map of clientMessageId -> messageId for deduplication
const typingDebounceMap = new Map(); // Map of userId -> debounce timeout for typing events
const socketMetrics = {
  activeConnections: 0,
  messagesPerMinute: 0,
  lastMetricsReset: Date.now()
};

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;
    
    // Fallback: extract jwt token from cookie header since the cookie is httpOnly
    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';');
      const jwtCookie = cookies.find(c => c.trim().startsWith('jwt='));
      if (jwtCookie) {
        token = jwtCookie.split('=')[1]?.trim();
      }
    }
    
    // Handle missing token gracefully - treat as normal initial connection
    if (!token) {
      logger.info('Socket connection without token (expected for initial connection)', {
        socketId: socket.id,
        ip: socket.handshake.address
      });
      return next(new Error("Authentication error"));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      
      logger.info('Socket authenticated', {
        socketId: socket.id,
        userId: decoded.userId
      });
      
      next();
    } catch (jwtError) {
      // Only log real JWT verification failures as security warnings
      logger.warn('Invalid socket token detected - JWT verification failed', {
        socketId: socket.id,
        error: jwtError.message,
        ip: socket.handshake.address
      });
      next(new Error("Authentication error"));
    }
  } catch (error) {
    logger.error('Error in socket authentication middleware', {
      socketId: socket.id,
      error: error.message,
      stack: error.stack,
      ip: socket.handshake.address
    });
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  logger.info('User connected via socket', {
    socketId: socket.id,
    userId: socket.user.userId
  });

  const userId = socket.user.userId;
  userSocketMap[userId] = socket.id;
  socketMetrics.activeConnections++;
  
  // Join user to their own room for personal events
  socket.join(userId);
  
  // Notify friends (only) about online status
  const User = (await import("../models/user.model.js")).default;
  const currentUser = await User.findById(userId).select("friends privacy");
  
  if (currentUser?.privacy?.showOnlineStatus !== false) {
    const friendIds = (currentUser?.friends || []).map(f => f.toString());
    friendIds.forEach(friendId => {
      const friendSocketId = userSocketMap[friendId];
      if (friendSocketId) {
        io.to(friendSocketId).emit("user:status", { userId, status: "online" });
      }
    });
  }

  // Send online friends to THIS user (not all online users)
  const onlineFriends = (currentUser?.friends || []).filter(fid => userSocketMap[fid.toString()]).map(fid => fid.toString());
  socket.emit("getOnlineUsers", onlineFriends);
  socket.emit("status:list", Array.from(userStatuses.values()));

  // ==================== ROOM LIFECYCLE ===================
  socket.on("chat:join", (data) => {
    try {
      const { otherUserId } = data;
      const roomId = [userId, otherUserId].sort().join("_");
      socket.join(roomId);
      logger.info('User joined chat room', { userId, roomId });
    } catch (error) {
      logger.error('Error joining chat room', { error: error.message });
    }
  });

  socket.on("chat:leave", (data) => {
    try {
      const { otherUserId } = data;
      const roomId = [userId, otherUserId].sort().join("_");
      socket.leave(roomId);
      logger.info('User left chat room', { userId, roomId });
    } catch (error) {
      logger.error('Error leaving chat room', { error: error.message });
    }
  });

  // ==================== STREAM ROOM LIFECYCLE ===================
  socket.on("room:join", (data) => {
    try {
      const { roomId, channelId } = data;
      const socketRoomId = `room_${roomId}_${channelId}`;
      socket.join(socketRoomId);
      logger.info('User joined stream room channel', { userId, socketRoomId });
    } catch (error) {
      logger.error('Error joining stream room channel', { error: error.message });
    }
  });

  socket.on("room:leave", (data) => {
    try {
      const { roomId, channelId } = data;
      const socketRoomId = `room_${roomId}_${channelId}`;
      socket.leave(socketRoomId);
      logger.info('User left stream room channel', { userId, socketRoomId });
    } catch (error) {
      logger.error('Error leaving stream room channel', { error: error.message });
    }
  });

  socket.on("room:message:send", async (data, callback) => {
    try {
      const { roomId, channelId, content } = data;
      if (!roomId || !channelId || !content) {
        return callback?.({ success: false, error: "Missing required fields" });
      }

      const cleanContent = sanitizeHtml(content, {
        allowedTags: [],
        allowedAttributes: {}
      });

      const RoomMessageModel = (await import("../models/roomMessage.model.js")).default;
      const RoomModel = (await import("../models/room.model.js")).default;

      const room = await RoomModel.findById(roomId);
      if (!room) {
        return callback?.({ success: false, error: "Room not found" });
      }

      // Add user as a member of the room if they aren't already
      if (!room.members.some(mid => mid.toString() === userId)) {
        room.members.push(userId);
        room.echoScore = (room.echoScore || 0) + 50;
        await room.save();
      }

      // Create new RoomMessage
      const roomMessage = new RoomMessageModel({
        roomId,
        channelId,
        senderId: userId,
        text: cleanContent,
        type: "text",
      });

      const savedMessage = await roomMessage.save();
      await savedMessage.populate("senderId", "fullName profilePic echoTier");

      // Award 15 Echo Score points to sender on room message send
      const UserModel = (await import("../models/user.model.js")).default;
      const sender = await UserModel.findById(userId);
      if (sender) {
        sender.echoScore = (sender.echoScore || 0) + 15;
        const { calculateTier } = await import("../controllers/echo.controller.js");
        sender.echoTier = calculateTier(sender.echoScore);
        await sender.save();

        socket.emit("echo:scoreUpdate", {
          score: sender.echoScore,
          tier: sender.echoTier,
          rank: await UserModel.countDocuments({ echoScore: { $gt: sender.echoScore } }) + 1
        });
      }

      // Broadcast to all in the room channel
      const socketRoomId = `room_${roomId}_${channelId}`;
      io.to(socketRoomId).emit("room:message:new", savedMessage);

      callback?.({ success: true, message: savedMessage });
    } catch (error) {
      logger.error('Error sending room message via socket', { error: error.message });
      callback?.({ success: false, error: "Failed to send room message" });
    }
  });

  // ==================== RECONNECTION SYNC ===================
  socket.on("messages:sync", async (data, callback) => {
    try {
      const { otherUserId, lastMessageTimestamp } = data;
      
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        createdAt: { $gt: new Date(lastMessageTimestamp) },
        isDeleted: { $ne: true }
      })
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic")
      .sort({ createdAt: 1 });
      
      callback?.({ success: true, messages });
    } catch (error) {
      logger.error('Error syncing messages', { error: error.message });
      callback?.({ success: false, error: "Failed to sync messages" });
    }
  });

  // ==================== CHAT MESSAGING ===================
  socket.on("message:send", async (data, callback) => {
    try {
      // Validate required fields and authorization
      if (!data.receiverId || !data.content) {
        return callback?.({ success: false, error: "Missing required fields" });
      }

      // Prevent sending to self
      if (data.receiverId === userId) {
        return callback?.({ success: false, error: "Cannot send message to self" });
      }

      // Rate limiting: max 20 messages per 10 seconds with memory cleanup
      const now = Date.now();
      const userRateLimit = messageRateMap.get(userId) || [];
      const recentMessages = userRateLimit.filter(timestamp => now - timestamp < 10000);
      
      if (recentMessages.length >= 20) {
        return callback?.({ success: false, error: "Rate limit exceeded" });
      }
      
      recentMessages.push(now);
      
      // Clean up empty entries to prevent memory growth
      if (recentMessages.length === 0) {
        messageRateMap.delete(userId);
      } else {
        messageRateMap.set(userId, recentMessages);
      }

      // Message deduplication
      if (data.clientMessageId) {
        const existingMessageId = clientMessageMap.get(data.clientMessageId);
        if (existingMessageId) {
          const existingMessage = await Message.findById(existingMessageId).populate("senderId", "fullName profilePic");
          if (existingMessage) {
            return callback?.({ success: true, message: existingMessage });
          }
        }
      }

      // Validate receiver exists
      const UserModel = (await import("../models/user.model.js")).default;
      const receiver = await UserModel.findById(data.receiverId);
      if (!receiver) {
        return callback?.({ success: false, error: "Receiver not found" });
      }

      // --- SOCIAL GRAPH CHECKS ---
      const sender = await UserModel.findById(userId);
      
      // Block check
      if (
        sender.blockedUsers.some(bid => bid.toString() === data.receiverId) ||
        receiver.blockedUsers.some(bid => bid.toString() === userId)
      ) {
        return callback?.({ success: false, error: "Cannot send message to this user" });
      }

      // DM permission check
      const areFriends = sender.friends.some(fid => fid.toString() === data.receiverId);
      if (!areFriends && receiver.privacy?.allowDMsFrom === "friends") {
        return callback?.({ success: false, error: "This user only accepts messages from friends" });
      }
      if (receiver.privacy?.allowDMsFrom === "nobody") {
        return callback?.({ success: false, error: "This user has disabled direct messages" });
      }

      // Sanitize message content
      const cleanContent = sanitizeHtml(data.content, {
        allowedTags: [],
        allowedAttributes: {}
      });

      // Create chat-specific room
      const roomId = [userId, data.receiverId].sort().join("_");
      
      // Determine message type
      let messageType = "text";
      let imageUrl = null;
      let audioUrl = null;
      
      if (data.image) {
        messageType = "image";
        imageUrl = data.image;
      } else if (data.audioUrl) {
        messageType = "voice";
        audioUrl = data.audioUrl;
      }

      // Create and save message to database
      const message = new Message({
        senderId: userId,
        receiverId: data.receiverId,
        text: cleanContent,
        type: messageType,
        image: imageUrl,
        audioUrl: audioUrl,
        status: "sent"
      });

      const savedMessage = await message.save();
      
      // Award 10 Echo Score points to sender on direct message send
      if (sender) {
        sender.echoScore = (sender.echoScore || 0) + 10;
        const { calculateTier } = await import("../controllers/echo.controller.js");
        sender.echoTier = calculateTier(sender.echoScore);
        await sender.save();

        socket.emit("echo:scoreUpdate", {
          score: sender.echoScore,
          tier: sender.echoTier,
          rank: await UserModel.countDocuments({ echoScore: { $gt: sender.echoScore } }) + 1
        });
      }
      
      // --- AUTO-UPDATE CONVERSATION ---
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, data.receiverId] },
      });

      const previewText = cleanContent || (imageUrl ? "[Image]" : audioUrl ? "[Voice]" : "");

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, data.receiverId],
          lastMessage: { text: previewText, senderId: userId, createdAt: new Date() },
          unreadCount: new Map([[data.receiverId, 1]]),
        });
      } else {
        conversation.lastMessage = { text: previewText, senderId: userId, createdAt: new Date() };
        const currentUnread = conversation.unreadCount.get(data.receiverId) || 0;
        conversation.unreadCount.set(data.receiverId, currentUnread + 1);
      }
      await conversation.save();

      // Track metrics with periodic reset
      if (Date.now() - socketMetrics.lastMetricsReset > 60000) {
        socketMetrics.messagesPerMinute = 0;
        socketMetrics.lastMetricsReset = Date.now();
      }
      socketMetrics.messagesPerMinute++;
      
      // Backpressure guard
      if (socketMetrics.messagesPerMinute > 1000) {
        return callback?.({ success: false, error: "Server busy, try later" });
      }
      
      // Store client message ID for deduplication with TTL cleanup
      if (data.clientMessageId) {
        clientMessageMap.set(data.clientMessageId, savedMessage._id);
        setTimeout(() => {
          clientMessageMap.delete(data.clientMessageId);
        }, 60000);
      }
      
      // Populate sender info for frontend
      await savedMessage.populate("senderId", "fullName profilePic");

      // Send to chat room (both users)
      io.to(roomId).emit("message:new", savedMessage);
      
      // Emit conversation update to receiver
      const receiverSocketId = getReceiverSocketId(data.receiverId);
      if (receiverSocketId) {
        await Message.findByIdAndUpdate(savedMessage._id, { status: "delivered" });
        io.to(roomId).emit("message:delivered", { messageId: savedMessage._id });
        io.to(receiverSocketId).emit("conversation:updated", {
          conversationId: conversation._id,
          lastMessage: conversation.lastMessage,
          unreadCount: conversation.unreadCount.get(data.receiverId),
        });
      }

      // Emit conversation update to sender
      socket.emit("conversation:updated", {
        conversationId: conversation._id,
        lastMessage: conversation.lastMessage,
        unreadCount: 0,
      });
      
      // Acknowledge successful send
      callback?.({ success: true, message: savedMessage });

    } catch (error) {
      logger.error('Error sending message via socket', {
        error: error.message,
        stack: error.stack,
        senderId: userId,
        receiverId: data.receiverId
      });
      socket.emit("error", { message: "Failed to send message" });
      callback?.({ success: false, error: "Failed to send message" });
    }
  });

  // ==================== TYPING INDICATOR ===================
  socket.on("typing:start", (data) => {
    try {
      // Validate receiver exists
      if (!data.receiverId) return;
      
      // Use authenticated user ID, not client-provided
      typingUsers.add(userId);
      
      // Debounce typing events (emit every 500ms max)
      const existingTimeout = typingDebounceMap.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      const timeout = setTimeout(() => {
        const roomId = [userId, data.receiverId].sort().join("_");
        socket.to(roomId).emit("typing:update", {
          userId,
          isTyping: true
        });
        typingDebounceMap.delete(userId);
      }, 500);
      
      typingDebounceMap.set(userId, timeout);
    } catch (error) {
      logger.error('Error in typing:start handler', { error: error.message });
    }
  });

  socket.on("typing:stop", (data) => {
    try {
      // Validate receiver exists
      if (!data.receiverId) return;
      
      // Use authenticated user ID, not client-provided
      typingUsers.delete(userId);
      
      // Clear any existing debounce timeout
      const existingTimeout = typingDebounceMap.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingDebounceMap.delete(userId);
      }
      
      // Use room-based broadcasting
      const roomId = [userId, data.receiverId].sort().join("_");
      socket.to(roomId).emit("typing:update", {
        userId,
        isTyping: false
      });
    } catch (error) {
      logger.error('Error in typing:stop handler', { error: error.message });
    }
  });

  // ==================== STATUS MANAGEMENT ===================
  socket.on("status:upload", (data) => {
    try {
      const status = {
        userId: userId,
        mediaUrl: data.mediaUrl,
        type: data.type || "image",
        expiresAt: data.expiresAt || Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        createdAt: Date.now()
      };
      userStatuses.set(userId, status);
      
      // Broadcast updated status list
      io.emit("status:list", Array.from(userStatuses.values()));
      
      if (process.env.NODE_ENV !== "production") {
        console.log("Status uploaded:", status);
      }
    } catch (error) {
      logger.error('Error in status:upload handler', { error: error.message });
    }
  });

  // ==================== MESSAGE SEEN / EDIT / DELETE ===================
  socket.on("message:seen", async (data, callback) => {
    try {
      const { messageId } = data;
      
      // Update message status to seen
      const message = await Message.findOneAndUpdate(
        { _id: messageId, receiverId: userId },
        { status: "seen" },
        { new: true }
      ).populate("senderId", "fullName");
      
      if (message) {
        // Notify sender that message was seen
        const roomId = [message.senderId._id, userId].sort().join("_");
        io.to(roomId).emit("message:seen", { 
          messageId: message._id,
          seenBy: userId,
          seenAt: new Date()
        });
      }
      
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error marking message as seen', { error: error.message });
      callback?.({ success: false, error: "Failed to mark message as seen" });
    }
  });

  socket.on("message:edit", async (data, callback) => {
    try {
      const { messageId, newText } = data;
      
      // Validate ownership
      const message = await Message.findOne({ _id: messageId, senderId: userId });
      if (!message) {
        return callback?.({ success: false, error: "Message not found or unauthorized" });
      }
      
      // Sanitize new content
      const cleanText = sanitizeHtml(newText, {
        allowedTags: [],
        allowedAttributes: {}
      });
      
      // Update message
      message.text = cleanText;
      await message.save();
      
      // Notify chat participants
      const roomId = [userId, message.receiverId].sort().join("_");
      io.to(roomId).emit("message:edited", {
        messageId: message._id,
        newText: cleanText,
        editedAt: new Date()
      });
      
      callback?.({ success: true, message });
    } catch (error) {
      logger.error('Error editing message', { error: error.message });
      callback?.({ success: false, error: "Failed to edit message" });
    }
  });

  socket.on("message:delete", async (data, callback) => {
    try {
      const { messageId } = data;
      
      // Validate ownership
      const message = await Message.findOne({ _id: messageId, senderId: userId });
      if (!message) {
        return callback?.({ success: false, error: "Message not found or unauthorized" });
      }
      
      // Soft delete
      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();
      
      // Notify chat participants
      const roomId = [userId, message.receiverId].sort().join("_");
      io.to(roomId).emit("message:deleted", {
        messageId: message._id,
        deletedAt: new Date()
      });
      
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error deleting message', { error: error.message });
      callback?.({ success: false, error: "Failed to delete message" });
    }
  });

  // ==================== PAGINATED MESSAGE FETCH ===================
  socket.on("messages:get", async (data, callback) => {
    try {
      const { otherUserId, page = 1, limit = 50 } = data;
      
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        isDeleted: { $ne: true }
      })
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
      const total = await Message.countDocuments({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        isDeleted: { $ne: true }
      });
      
      callback?.({ 
        success: true, 
        messages: messages.reverse(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching messages', { error: error.message });
      callback?.({ success: false, error: "Failed to fetch messages" });
    }
  });
  socket.on("voice:send", async (data, callback) => {
    try {
      // Validate required fields
      if (!data.receiverId || !data.audioUrl) {
        return callback?.({ success: false, error: "Missing required fields" });
      }

      // Create and save voice message to database with proper schema
      const message = new Message({
        senderId: userId,
        receiverId: data.receiverId,
        text: "[Voice Message]",
        type: "voice",
        audioUrl: data.audioUrl,
        status: "sent"
      });

      const savedMessage = await message.save();
      
      // Populate sender info
      await savedMessage.populate("senderId", "fullName profilePic");

      // Send to receiver
      const receiverSocketId = getReceiverSocketId(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:new", {
          ...savedMessage.toObject(),
          duration: data.duration
        });
        // Update status to delivered
        await Message.findByIdAndUpdate(savedMessage._id, { status: "delivered" });
      }

      // Send back to sender
      socket.emit("message:new", {
        ...savedMessage.toObject(),
        duration: data.duration
      });
      
      callback?.({ success: true, message: savedMessage });

    } catch (error) {
      logger.error('Error sending voice message', { error: error.message });
      socket.emit("error", { message: "Failed to send voice message" });
      callback?.({ success: false, error: "Failed to send voice message" });
    }
  });

  // ==================== CALL SIGNALING ===================
  socket.on("call:start", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:incoming", {
        from: data.from,
        chatId: data.chatId
      });
    }
  });

  socket.on("call:accept", (data) => {
    const receiverSocketId = getReceiverSocketId(data.from);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:accepted", { chatId: data.chatId });
    }
  });

  socket.on("call:reject", (data) => {
    const receiverSocketId = getReceiverSocketId(data.from);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:rejected", { chatId: data.chatId });
    }
  });

  // ==================== DISCONNECT ===================
  socket.on("disconnect", async () => {
    try {
      logger.info('User disconnected from socket', {
        socketId: socket.id,
        userId: userId
      });
      
      if (userId) {
        // Clean up all user data
        delete userSocketMap[userId];
        typingUsers.delete(userId);
        userStatuses.delete(userId);
        messageRateMap.delete(userId);
        
        // Clear typing debounce timeout
        const typingTimeout = typingDebounceMap.get(userId);
        if (typingTimeout) {
          clearTimeout(typingTimeout);
          typingDebounceMap.delete(userId);
        }
        
        socketMetrics.activeConnections--;
        
        // Notify friends (only) about offline status
        try {
          const UserModel = (await import("../models/user.model.js")).default;
          const disconnectedUser = await UserModel.findById(userId).select("friends");
          const friendIds = (disconnectedUser?.friends || []).map(f => f.toString());
          friendIds.forEach(friendId => {
            const friendSocketId = userSocketMap[friendId];
            if (friendSocketId) {
              io.to(friendSocketId).emit("user:status", { userId, status: "offline" });
              // We need to get the friend's friends list, but for efficiency just notify status
            }
          });
        } catch (e) {
          logger.error('Error notifying friends on disconnect', { error: e.message });
        }
      }
    } catch (error) {
      logger.error('Error in disconnect handler', { error: error.message });
    }
  });
});

export { io, app, server };
