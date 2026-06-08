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

export const getAurevScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const score = user.aurevScore || 0;
    
    // Find the rank position dynamically: count of users with higher score + 1
    const rank = await User.countDocuments({ aurevScore: { $gt: score } }) + 1;

    res.status(200).json({
      score,
      tier: user.aurevTier || "bronze",
      rank
    });
  } catch (error) {
    logger.error("Error in getAurevScore:", error);
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
    query.aurevScore = { $gt: 0 };

    const leaderboard = await User.find(query)
      .select("fullName profilePic aurevScore aurevTier email")
      .sort({ aurevScore: -1 })
      .limit(50);

    const rankedLeaderboard = leaderboard.map((user, index) => {
      const emailUsername = user.email.split("@")[0];
      return {
        _id: user._id,
        fullName: user.fullName,
        username: emailUsername,
        profilePic: user.profilePic,
        aurevScore: user.aurevScore,
        tier: user.aurevTier,
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
