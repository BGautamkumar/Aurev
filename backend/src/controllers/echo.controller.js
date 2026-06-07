import User from "../models/user.model.js";
import logger from "../lib/logger.js";

// Helper to determine the tier based on score thresholds
export const calculateTier = (score) => {
  if (score >= 5000) return "legend";
  if (score >= 2000) return "diamond";
  if (score >= 500) return "gold";
  if (score >= 100) return "silver";
  return "bronze";
};

export const getEchoScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const score = user.echoScore || 0;
    
    // Find the rank position dynamically: count of users with higher score + 1
    const rank = await User.countDocuments({ echoScore: { $gt: score } }) + 1;

    res.status(200).json({
      score,
      tier: user.echoTier || "bronze",
      rank
    });
  } catch (error) {
    logger.error("Error in getEchoScore:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { filter = "global" } = req.query;

    let query = {};
    if (filter === "friends") {
      const currentUser = await User.findById(req.user._id);
      const friendsList = currentUser?.friends || [];
      query = { _id: { $in: [req.user._id, ...friendsList] } };
    }

    // Only include users with non-zero scores to reflect real activity
    query.echoScore = { $gt: 0 };

    const leaderboard = await User.find(query)
      .select("fullName profilePic echoScore echoTier email")
      .sort({ echoScore: -1 })
      .limit(50);

    const rankedLeaderboard = leaderboard.map((user, index) => {
      const emailUsername = user.email.split("@")[0];
      return {
        _id: user._id,
        fullName: user.fullName,
        username: emailUsername,
        profilePic: user.profilePic,
        echoScore: user.echoScore,
        tier: user.echoTier,
        rank: index + 1,
        trend: "stable",
      };
    });

    res.status(200).json(rankedLeaderboard);
  } catch (error) {
    logger.error("Error in getLeaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
