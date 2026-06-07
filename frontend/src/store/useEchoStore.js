import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useEchoStore = create((set) => ({
  // User's own echo data
  echoScore: 0,
  echoTier: "bronze", // bronze | silver | gold | diamond | legend
  echoRank: null,
  echoHistory: [],

  // Leaderboard
  leaderboard: [],
  isLoadingLeaderboard: false,

  // Actions
  getEchoScore: async () => {
    try {
      const res = await axiosInstance.get("/echo/score");
      set({ echoScore: res.data.score, echoTier: res.data.tier, echoRank: res.data.rank });
    } catch (error) {
      console.error("Failed to load echo score:", error);
    }
  },

  getLeaderboard: async (filter = "global", timeRange = "all") => {
    set({ isLoadingLeaderboard: true });
    try {
      const res = await axiosInstance.get(`/echo/leaderboard?filter=${filter}&range=${timeRange}`);
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

  getEchoHistory: async () => {
    // Dynamic history logs
  },

  // Real-time score updates via socket
  subscribeToEchoUpdates: (socket) => {
    if (!socket) return;
    
    // Prevent duplicate listeners
    socket.off("echo:scoreUpdate");
    socket.on("echo:scoreUpdate", (data) => {
      set({ echoScore: data.score, echoTier: data.tier, echoRank: data.rank });
    });
  },

  unsubscribeFromEchoUpdates: (socket) => {
    socket?.off("echo:scoreUpdate");
  },
}));
