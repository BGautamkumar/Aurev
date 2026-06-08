import Room from "../models/room.model.js";
import RoomMessage from "../models/roomMessage.model.js";
import logger from "../lib/logger.js";

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({})
      .populate("creator", "fullName profilePic")
      .populate("members", "fullName profilePic aurevTier")
      .sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    logger.error("Error in getRooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, description, category, trendingTopic } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }
    
    // Check clean name uniqueness
    const existingRoom = await Room.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existingRoom) {
      return res.status(400).json({ message: "Room name already exists" });
    }

    const defaultChannels = [
      { name: "general", type: "text", topic: "General discussions" },
      { name: "voice", type: "voice", topic: "Voice room" }
    ];

    const newRoom = new Room({
      name: name.trim(),
      description: description || "A custom Momentum Stream Room.",
      category: category || "tech",
      creator: req.user._id,
      members: [req.user._id],
      channels: defaultChannels,
      trendingTopic: trendingTopic || "Fresh starts",
      heatmap: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      health: "warm",
      aurevScore: 100,
    });

    await newRoom.save();
    await newRoom.populate("creator", "fullName profilePic");

    res.status(201).json(newRoom);
  } catch (error) {
    logger.error("Error in createRoom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId, channelId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const messages = await RoomMessage.find({ roomId, channelId })
      .populate("senderId", "fullName profilePic aurevTier")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Return in chronological order (oldest first)
    res.status(200).json(messages.reverse());
  } catch (error) {
    logger.error("Error in getRoomMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
