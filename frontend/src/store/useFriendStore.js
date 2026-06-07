import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  blockedUsers: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,

  // Get friends list
  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  },

  // Get pending friend requests (received)
  getPendingRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ pendingRequests: res.data });
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  },

  // Get sent requests
  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/sent");
      set({ sentRequests: res.data });
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  },

  // Get blocked users
  getBlockedUsers: async () => {
    try {
      const res = await axiosInstance.get("/friends/blocked");
      set({ blockedUsers: res.data });
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  },

  // Search users
  searchUsers: async (query) => {
    if (!query || query.trim().length < 2) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/friends/search?q=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      set({ isSearching: false });
    }
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post(`/friends/request/${userId}`);
      toast.success(res.data.message);

      // If auto-accepted, refresh friends
      if (res.data.status === "accepted") {
        get().getFriends();
      }

      // Update search results to reflect new status
      set((state) => ({
        searchResults: state.searchResults.map((u) =>
          u._id === userId
            ? { ...u, friendshipStatus: res.data.status || "pending", isRequestFromMe: true }
            : u
        ),
      }));

      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send request";
      toast.error(msg);
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.put(`/friends/accept/${userId}`);
      toast.success("Friend request accepted");

      // Remove from pending, add to friends
      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.user._id !== userId),
      }));

      // Refresh friends list
      get().getFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  // Decline friend request
  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.put(`/friends/decline/${userId}`);
      toast.success("Friend request declined");

      set((state) => ({
        pendingRequests: state.pendingRequests.filter((r) => r.user._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  },

  // Remove friend
  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/remove/${userId}`);
      toast.success("Friend removed");

      set((state) => ({
        friends: state.friends.filter((f) => f._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },

  // Block user
  blockUser: async (userId) => {
    try {
      await axiosInstance.post(`/friends/block/${userId}`);
      toast.success("User blocked");

      set((state) => ({
        friends: state.friends.filter((f) => f._id !== userId),
      }));

      get().getBlockedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    }
  },

  // Unblock user
  unblockUser: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/unblock/${userId}`);
      toast.success("User unblocked");

      set((state) => ({
        blockedUsers: state.blockedUsers.filter((u) => u._id !== userId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unblock user");
    }
  },

  // Clear search results
  clearSearch: () => set({ searchResults: [] }),

  // Subscribe to real-time friend events
  subscribeToFriendEvents: (socket) => {
    if (!socket) return;

    socket.on("friend:request", (data) => {
      toast.success(`${data.user.fullName} sent you a friend request!`);
      get().getPendingRequests();
    });

    socket.on("friend:accepted", (data) => {
      toast.success(`${data.user.fullName} accepted your friend request!`);
      get().getFriends();
      set((state) => ({
        sentRequests: state.sentRequests.filter((r) => r.user._id !== data.userId),
      }));
    });

    socket.on("friend:removed", (data) => {
      set((state) => ({
        friends: state.friends.filter((f) => f._id !== data.userId),
      }));
    });
  },

  // Unsubscribe from friend events
  unsubscribeFromFriendEvents: (socket) => {
    if (!socket) return;
    socket.off("friend:request");
    socket.off("friend:accepted");
    socket.off("friend:removed");
  },
}));
