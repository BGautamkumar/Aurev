import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "voice"],
      default: "text",
    },
    image: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for fast history retrieval
roomMessageSchema.index({ roomId: 1, channelId: 1, createdAt: -1 });

const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema);
export default RoomMessage;
