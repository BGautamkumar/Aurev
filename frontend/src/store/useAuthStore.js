import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5002" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isSocketConnected: false,
  socketError: null,
  isForgotPasswordLoading: false,
  isResetPasswordLoading: false,

  forgotPassword: async (email) => {
    set({ isForgotPasswordLoading: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send reset link";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isForgotPasswordLoading: false });
    }
  },

  resetPassword: async (token, password) => {
    set({ isResetPasswordLoading: true });
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || "Password reset successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isResetPasswordLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Signup failed";
      toast.error(errorMessage);
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Logout failed";
      toast.error(errorMessage);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Profile update failed";
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  uploadProfilePicture: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      
      const res = await axiosInstance.post("/auth/upload-profile-pic", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      set({ authUser: res.data });
      toast.success("Profile picture updated successfully");
      return res.data;
    } catch (error) {
      console.log("error in upload profile picture:", error);
      const errorMessage = error.response?.data?.message || error.message || "Profile picture upload failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    // Get JWT token from cookies if readable (fallback)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('jwt='))
      ?.split('=')[1];

    const socket = io(BASE_URL, {
      withCredentials: true,
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socket.connect();

    set({ socket: socket });

    socket.on("connect", () => {
      set({ isSocketConnected: true, socketError: null });
    });

    socket.on("disconnect", () => {
      set({ isSocketConnected: false, onlineUsers: [] });
      import("./useChatStore.js")
        .then(({ useChatStore }) => {
          useChatStore.setState({ onlineUsers: new Set() });
        })
        .catch(() => {});
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      set({ isSocketConnected: false, socketError: error.message });
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
      import("./useChatStore.js")
        .then(({ useChatStore }) => {
          useChatStore.setState({ onlineUsers: new Set(userIds) });
        })
        .catch(() => {});
    });

    socket.on("user:status", (data) => {
      set((state) => {
        const currentList = state.onlineUsers || [];
        let updatedList;
        if (data.status === "online") {
          if (!currentList.includes(data.userId)) {
            updatedList = [...currentList, data.userId];
          } else {
            updatedList = currentList;
          }
        } else {
          updatedList = currentList.filter((id) => id !== data.userId);
        }

        import("./useChatStore.js")
          .then(({ useChatStore }) => {
            const newSet = new Set(useChatStore.getState().onlineUsers);
            if (data.status === "online") {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            useChatStore.setState({ onlineUsers: newSet });
          })
          .catch(() => {});

        return { onlineUsers: updatedList };
      });
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isSocketConnected: false, onlineUsers: [] });
      import("./useChatStore.js")
        .then(({ useChatStore }) => {
          useChatStore.setState({ onlineUsers: new Set() });
        })
        .catch(() => {});
    }
  },
  clearAuth: () => {
    set({ authUser: null });
    get().disconnectSocket();
  },
}));
