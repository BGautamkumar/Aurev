import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      text: { type: String, default: "" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    },
    // Per-user unread counts stored as a Map: { "userId": count }
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    // Per-user pin status
    pinnedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Per-user archive status
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for fast participant lookups
conversationSchema.index({ participants: 1 });
// Index for ordering by last message time
conversationSchema.index({ "lastMessage.createdAt": -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
