import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Unique compound index — only one friendship record per user pair
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Fast lookup for pending requests received by a user
friendshipSchema.index({ recipient: 1, status: 1 });
// Fast lookup for all friendships by status
friendshipSchema.index({ status: 1 });

const Friendship = mongoose.model("Friendship", friendshipSchema);

export default Friendship;
