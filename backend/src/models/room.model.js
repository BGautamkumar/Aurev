import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["tech", "gaming", "music", "art", "crypto", "science"],
      default: "tech",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    channels: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["text", "voice"],
          default: "text",
        },
        topic: {
          type: String,
          default: "",
        },
      },
    ],
    trendingTopic: {
      type: String,
      default: "",
    },
    aurevScore: {
      type: Number,
      default: 0,
    },
    health: {
      type: String,
      enum: ["hot", "warm", "cool"],
      default: "cool",
    },
    heatmap: {
      type: [Number],
      default: () => Array(24).fill(0),
    },
  },
  { timestamps: true }
);

roomSchema.index({ name: 1 });
roomSchema.index({ category: 1 });

const Room = mongoose.model("Room", roomSchema);
export default Room;
