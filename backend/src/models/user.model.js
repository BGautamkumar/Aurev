import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePic: {
      type: String,
      default: "",
    },
    // Cached friend IDs for fast lookups (synced by friendship controller)
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Cached blocked user IDs
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Privacy settings
    privacy: {
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      allowDMsFrom: {
        type: String,
        enum: ["friends", "everyone", "nobody"],
        default: "friends",
      },
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      readReceipts: {
        type: Boolean,
        default: true,
      },
    },
    // Aurev Rank parameters
    aurevScore: {
      type: Number,
      default: 0,
    },
    aurevTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "diamond", "legend"],
      default: "bronze",
    },
  },
  { timestamps: true }
);

// Indexes for friend lookups and leaderboard sorting
userSchema.index({ friends: 1 });
userSchema.index({ aurevScore: -1 });

const User = mongoose.model("User", userSchema);

export default User;
