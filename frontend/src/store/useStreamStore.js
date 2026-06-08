import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { useOfflineStore } from "./useOfflineStore.js";
import toast from "react-hot-toast";

export const useStreamStore = create((set, get) => ({
  rooms: [],
  activeRoom: null,
  activeChannel: null,
  activeChannelMessages: {},
  isLoadingRooms: false,
  
  // Voice connection state
  isVoiceConnected: false,
  connectedVoiceChannel: null,
  voiceLatency: "0ms",
  latencyIntervalId: null,

  // Actions
  fetchRooms: async () => {
    set({ isLoadingRooms: true });
    try {
      const res = await axiosInstance.get("/rooms");
      set({ rooms: res.data });
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to fetch frequencies");
    } finally {
      set({ isLoadingRooms: false });
    }
  },

  createRoom: async (roomData) => {
    try {
      const res = await axiosInstance.post("/rooms", roomData);
      set((state) => ({
        rooms: [res.data, ...state.rooms]
      }));
      toast.success("Frequency space established");
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to establish room";
      toast.error(msg);
      throw error;
    }
  },

  joinRoom: async (roomId) => {
    // Find room in current rooms list
    const room = get().rooms.find((r) => r._id === roomId || r.id === roomId);
    if (!room) return;

    const defaultChannel = room.channels.find((c) => c.type === "text") || room.channels[0];
    
    set({
      activeRoom: room,
      activeChannel: defaultChannel
    });

    // Fetch history and listen to socket room
    if (defaultChannel) {
      get().joinChannelMessages(room._id, defaultChannel.name);
    }
    
    get().subscribeToRoomMessages();
  },

  joinChannelMessages: async (roomId, channelName) => {
    const { socket } = useAuthStore.getState();
    const currentActiveRoom = get().activeRoom;
    const currentActiveChannel = get().activeChannel;

    // Leave previous channel room if connected
    if (socket && currentActiveRoom && currentActiveChannel) {
      socket.emit("room:leave", { roomId: currentActiveRoom._id, channelId: currentActiveChannel.name });
    }

    const channel = currentActiveRoom?.channels?.find(c => c.name === channelName) || { name: channelName, type: 'text' };
    set({ activeChannel: channel });

    if (channel.type === "voice") {
      get().connectVoice(channelName);
      return;
    }

    // Fetch channel history messages
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}/channels/${channelName}/messages`);
      const key = `${roomId}-${channelName}`;
      set((state) => ({
        activeChannelMessages: {
          ...state.activeChannelMessages,
          [key]: res.data
        }
      }));
    } catch (error) {
      console.error("Failed to load channel messages:", error);
    }

    // Join room channel socket room
    if (socket) {
      socket.emit("room:join", { roomId, channelId: channelName });
    }
  },

  leaveRoom: () => {
    const { socket } = useAuthStore.getState();
    const { activeRoom, activeChannel } = get();
    if (socket && activeRoom && activeChannel) {
      socket.emit("room:leave", { roomId: activeRoom._id, channelId: activeChannel.name });
    }
    
    get().unsubscribeFromRoomMessages();
    get().disconnectVoice();
    
    set({
      activeRoom: null,
      activeChannel: null
    });
  },

  setActiveChannel: (channel) => {
    const { activeRoom } = get();
    if (activeRoom) {
      get().joinChannelMessages(activeRoom._id, channel.name);
    }
  },

  sendRoomMessage: async (roomId, channelId, text) => {
    const { socket, authUser } = useAuthStore.getState();
    const { isOnline } = useOfflineStore.getState();

    if (!isOnline) {
      toast.error("Offline. Cannot transmit to public frequencies.");
      return;
    }

    if (!socket) {
      toast.error("Connection lost. Failed to transmit spike.");
      return;
    }

    const clientMessageId = crypto.randomUUID();
    const key = `${roomId}-${channelId}`;

    const optimisticMessage = {
      _id: clientMessageId,
      roomId,
      channelId,
      content: text,
      sender: {
        _id: authUser._id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic,
        aurevTier: authUser.aurevTier || "bronze"
      },
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    set((state) => ({
      activeChannelMessages: {
        ...state.activeChannelMessages,
        [key]: [...(state.activeChannelMessages[key] || []), optimisticMessage]
      }
    }));

    socket.emit("room:message:send", {
      roomId,
      channelId,
      content: text,
      clientMessageId
    }, (response) => {
      if (response?.success) {
        set((state) => {
          const currentMessages = state.activeChannelMessages[key] || [];
          return {
            activeChannelMessages: {
              ...state.activeChannelMessages,
              [key]: currentMessages.map(m => 
                m._id === clientMessageId ? { ...response.message, status: 'delivered' } : m
              )
            }
          };
        });
      } else {
        toast.error(response?.error || "Failed to send message");
        set((state) => {
          const currentMessages = state.activeChannelMessages[key] || [];
          return {
            activeChannelMessages: {
              ...state.activeChannelMessages,
              [key]: currentMessages.map(m => 
                m._id === clientMessageId ? { ...m, status: 'failed' } : m
              )
            }
          };
        });
      }
    });
  },

  connectVoice: (channelName) => {
    if (get().isVoiceConnected) {
      get().disconnectVoice();
    }

    set({
      isVoiceConnected: true,
      connectedVoiceChannel: channelName,
      voiceLatency: "12ms"
    });

    const interval = setInterval(() => {
      const baseVal = Math.floor(Math.random() * 8) + 8;
      set({ voiceLatency: `${baseVal}ms` });
    }, 4000);

    set({ latencyIntervalId: interval });
  },

  disconnectVoice: () => {
    const intervalId = get().latencyIntervalId;
    if (intervalId) clearInterval(intervalId);

    set({
      isVoiceConnected: false,
      connectedVoiceChannel: null,
      voiceLatency: "0ms",
      latencyIntervalId: null
    });
  },

  subscribeToRoomMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("room:message:new");
    socket.on("room:message:new", (message) => {
      const key = `${message.roomId}-${message.channelId}`;
      set((state) => {
        const currentMessages = state.activeChannelMessages[key] || [];
        if (currentMessages.some((m) => m._id === message._id)) return state;

        if (message.clientMessageId) {
          const match = currentMessages.find(m => m._id === message.clientMessageId);
          if (match) {
            return {
              activeChannelMessages: {
                ...state.activeChannelMessages,
                [key]: currentMessages.map(m => m._id === message.clientMessageId ? { ...message, status: 'delivered' } : m)
              }
            };
          }
        }

        return {
          activeChannelMessages: {
            ...state.activeChannelMessages,
            [key]: [...currentMessages, message]
          }
        };
      });
    });
  },

  unsubscribeFromRoomMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("room:message:new");
    }
  }
}));
