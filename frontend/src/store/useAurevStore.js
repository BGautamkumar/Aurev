import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useAurevStore = create((set) => ({
  // User's own aurev data
  aurevScore: 0,
  aurevTier: "bronze", // bronze | silver | gold | diamond | legend
  aurevRank: null,
  aurevHistory: [],

  // Leaderboard
  leaderboard: [],
  isLoadingLeaderboard: false,

  // Actions
  getAurevScore: async () => {
    try {
      const res = await axiosInstance.get("/aurev/score");
      set({ aurevScore: res.data.score, aurevTier: res.data.tier, aurevRank: res.data.rank });
    } catch (error) {
      console.error("Failed to load aurev score:", error);
    }
  },

  getLeaderboard: async (filter = "global", timeRange = "all") => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await axiosInstance.get(`/aurev/leaderboard?filter=${filter}&range=${timeRange}`);
      set({ leaderboard: res.data });
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      set({ leaderboard: [] });
    } finally {
      set({ isLoadingLeaderboard: false });
    }
  },

  getScoreBreakdown: async () => {
    // Dynamic score details
  },

  getAurevHistory: async () => {
    // Dynamic history logs
  },

  // Real-time score updates via socket
  subscribeToAurevUpdates: (socket) => {
    if (!socket) return;
    
    // Prevent duplicate listeners
    socket.off("aurev:scoreUpdate");
    socket.on("aurev:scoreUpdate", (data) => {
      set({ aurevScore: data.score, aurevTier: data.tier, aurevRank: data.rank });
    });
  },

  unsubscribeFromAurevUpdates: (socket) => {
    socket?.off("aurev:scoreUpdate");
  },
}));
