import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useOfflineStore } from "./useOfflineStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  
  // Conversations state
  conversations: [],
  isConversationsLoading: false,
  
  // UI state
  searchQuery: "",
  activeTab: "all",
  showStatusModal: false,
  selectedStatus: null,
  showChatSearch: false,
  chatSearchQuery: "",
  typingUsers: new Set(),
  onlineUsers: new Set(),
  statuses: [],
  incomingCall: null,
  
  // Voice recording
  isRecording: false,
  recordingDuration: 0,
  audioBlob: null,
  
  // Socket handler references for cleanup
  socketHandlers: new Map(),
  
  // Error state
  connectionError: null,

  // Fetch friends for sidebar (replaces old "all users" approach)
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ users: res.data });
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch conversations with last message, unread counts, pin/archive
  getConversations: async () => {
    set({ isConversationsLoading: true });
    try {
      const res = await axiosInstance.get("/conversations");
      set({ conversations: res.data });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      set({ isConversationsLoading: false });
    }
  },

  // Pin/unpin a conversation
  pinConversation: async (conversationId) => {
    try {
      const res = await axiosInstance.put(`/conversations/${conversationId}/pin`);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, isPinned: res.data.isPinned } : c
        ),
      }));
    } catch {
      toast.error("Failed to pin conversation");
    }
  },

  // Archive/unarchive a conversation
  archiveConversation: async (conversationId) => {
    try {
      await axiosInstance.put(`/conversations/${conversationId}/archive`);
      // Remove from current view
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== conversationId),
      }));
      toast.success("Conversation archived");
    } catch {
      toast.error("Failed to archive conversation");
    }
  },

  // Mark a conversation as read
  markConversationAsRead: async (conversationId) => {
    try {
      await axiosInstance.put(`/conversations/${conversationId}/read`);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?limit=100`);
      // Handle both old format (direct array) and new format (paginated object)
      const messagesData = res.data.messages || res.data;
      set({ messages: messagesData });
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadMessages: async (userId) => {
    set({ isMessagesLoading: true, connectionError: null });
    const { socket } = useAuthStore.getState();
    
    if (!socket) {
      const error = "Connection lost";
      toast.error(error);
      set({ isMessagesLoading: false, connectionError: error });
      return;
    }

    socket.emit("messages:get", { 
      otherUserId: userId, 
      page: 1, 
      limit: 50 
    }, (response) => {
      if (response?.success) {
        set({ messages: response.messages, connectionError: null });
      } else {
        const error = response?.error || "Failed to load messages";
        toast.error(error);
        set({ connectionError: error });
      }
      set({ isMessagesLoading: false });
    });
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { socket } = useAuthStore.getState();
    const { isOnline, addPendingMessage, addFailedMessage } = useOfflineStore.getState();
    
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    // Generate unique client message ID for deduplication
    const clientMessageId = crypto.randomUUID();
    
    const messagePayload = {
      receiverId: selectedUser._id,
      content: messageData.text || "",
      image: messageData.image || null,
      audioUrl: messageData.audioUrl || null,
      clientMessageId,
    };

    const optimisticMessage = {
      ...messagePayload,
      _id: clientMessageId,
      senderId: {
        _id: useAuthStore.getState().authUser._id,
        fullName: useAuthStore.getState().authUser.fullName,
        profilePic: useAuthStore.getState().authUser.profilePic,
      },
      createdAt: new Date().toISOString(),
      status: 'pending',
      isOffline: !isOnline
    };

    // Optimistically add to local state instantly
    set((state) => ({
      messages: [...state.messages, optimisticMessage]
    }));

    // If offline, queue the message and stop
    if (!isOnline) {
      addPendingMessage(optimisticMessage);
      toast("Message queued offline");
      return;
    }

    if (!socket) {
      toast.error("Connection lost");
      addFailedMessage(optimisticMessage);
      set((state) => ({
        messages: state.messages.map(m => m._id === clientMessageId ? { ...m, status: 'failed' } : m)
      }));
      return;
    }
    
    try {
      socket.emit("message:send", messagePayload, (response) => {
        if (response?.success) {
          const newMessage = response.message;
          set((state) => ({
            messages: state.messages.map(m => 
              (m._id === clientMessageId || m.clientMessageId === clientMessageId) ? { ...newMessage, status: 'delivered' } : m
            )
          }));
        } else {
          toast.error(response?.error || "Failed to send message");
          addFailedMessage(optimisticMessage);
          set((state) => ({
            messages: state.messages.map(m => (m._id === clientMessageId || m.clientMessageId === clientMessageId) ? { ...m, status: 'failed' } : m)
          }));
        }
      });
      
    } catch {
      addFailedMessage(optimisticMessage);
      set((state) => ({
        messages: state.messages.map(m => (m._id === clientMessageId || m.clientMessageId === clientMessageId) ? { ...m, status: 'failed' } : m)
      }));
      toast.error("Failed to send message");
    }
  },

  resendPendingMessage: async (offlineMessage) => {
    const { socket } = useAuthStore.getState();
    const { removePendingMessage, addFailedMessage } = useOfflineStore.getState();
    
    if (!socket) return;
    
    const messagePayload = {
      receiverId: offlineMessage.receiverId,
      content: offlineMessage.content,
      image: offlineMessage.image,
      audioUrl: offlineMessage.audioUrl,
      clientMessageId: offlineMessage.clientMessageId || offlineMessage._id,
    };

    try {
      socket.emit("message:send", messagePayload, (response) => {
        if (response?.success) {
          removePendingMessage(offlineMessage._id);
          set((state) => ({
            messages: state.messages.map(m => 
              (m._id === offlineMessage._id || m.clientMessageId === messagePayload.clientMessageId) ? { ...response.message, status: 'delivered' } : m
            )
          }));
        } else {
          removePendingMessage(offlineMessage._id);
          addFailedMessage(offlineMessage);
          set((state) => ({
            messages: state.messages.map(m => (m._id === offlineMessage._id || m.clientMessageId === messagePayload.clientMessageId) ? { ...m, status: 'failed' } : m)
          }));
        }
      });
    } catch (error) {
      console.error("Failed to resend pending message", error);
    }
  },

  // ==================== TYPING INDICATORS ===================
  startTyping: () => {
    const { selectedUser } = get();
    const { socket, authUser } = useAuthStore.getState();
    if (selectedUser && socket) {
      const chatId = [selectedUser._id, authUser._id].sort().join("_");
      socket.emit("typing:start", {
        chatId,
        userId: authUser._id
      });
    }
  },

  stopTyping: () => {
    const { selectedUser } = get();
    const { socket, authUser } = useAuthStore.getState();
    if (selectedUser && socket) {
      const chatId = [selectedUser._id, authUser._id].sort().join("_");
      socket.emit("typing:stop", {
        chatId,
        userId: authUser._id
      });
    }
  },

  // ==================== STATUS MANAGEMENT ===================
  uploadStatus: (statusData) => {
    const { socket, authUser } = useAuthStore.getState();
    if (socket && authUser) {
      socket.emit("status:upload", {
        userId: authUser._id,
        ...statusData,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });
      toast.success("Status uploaded");
    }
  },

  // ==================== VOICE MESSAGING ===================
  startRecording: () => {
    set({ isRecording: true, recordingDuration: 0 });
  },

  stopRecording: () => {
    set({ isRecording: false, recordingDuration: 0 });
  },

  sendVoiceMessage: async (audioBlob, duration) => {
    const { selectedUser } = get();
    const { socket, authUser } = useAuthStore.getState();
    
    if (!selectedUser || !socket || !audioBlob) return;

    try {
      // Convert blob to base64 (simplified)
      const reader = new FileReader();
      reader.onloadend = () => {
        const audioUrl = reader.result;
        const chatId = [selectedUser._id, authUser._id].sort().join("_");
        
        socket.emit("voice:send", {
          chatId,
          senderId: authUser._id,
          receiverId: selectedUser._id,
          audioUrl,
          duration,
          createdAt: Date.now()
        });
      };
      reader.readAsDataURL(audioBlob);
      
      toast.success("Voice message sent");
    } catch {
      toast.error("Failed to send voice message");
    }
  },

  // ==================== CALL MANAGEMENT ===================
  startCall: (userId) => {
    const { socket, authUser } = useAuthStore.getState();
    if (socket && authUser) {
      const chatId = [userId, authUser._id].sort().join("_");
      socket.emit("call:start", {
        from: authUser._id,
        to: userId,
        chatId
      });
    }
  },

  acceptCall: () => {
    const { socket, incomingCall } = get();
    if (socket && incomingCall) {
      socket.emit("call:accept", {
        from: incomingCall.from,
        chatId: incomingCall.chatId
      });
      set({ incomingCall: null });
      toast.info("Call accepted");
    }
  },

  rejectCall: () => {
    const { socket, incomingCall } = get();
    if (socket && incomingCall) {
      socket.emit("call:reject", {
        from: incomingCall.from,
        chatId: incomingCall.chatId
      });
      set({ incomingCall: null });
      toast.info("Call rejected");
    }
  },

  // ==================== ROOM MANAGEMENT ===================
  joinChatRoom: (otherUserId) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("chat:join", { otherUserId });
    }
  },

  leaveChatRoom: (otherUserId) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("chat:leave", { otherUserId });
    }
  },

  // ==================== RECONNECTION SYNC ===================
  syncMessages: (otherUserId) => {
    const { messages } = get();
    const { socket } = useAuthStore.getState();
    
    if (socket && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastTimestamp = lastMessage.createdAt;
      
      socket.emit("messages:sync", { 
        otherUserId, 
        lastMessageTimestamp: lastTimestamp 
      }, (response) => {
        if (response?.success) {
          set((state) => {
            const merged = [...state.messages, ...response.messages];
            const unique = Array.from(
              new Map(merged.map(m => [m._id, m])).values()
            );
            return { messages: unique };
          });
        }
      });
    }
  },

  // ==================== SOCKET EVENT HANDLERS ===================
  subscribeToMessages: () => {
    const { selectedUser, socketHandlers } = get();
    const { socket } = useAuthStore.getState();
    if (!selectedUser || !socket) return;

    // Clear existing handlers
    get().unsubscribeFromMessages();

    // Define handlers with proper references for cleanup
    const handlers = {
      "message:new": (message) => {
        set((state) => {
          // Deduplicate by DB _id
          const exists = state.messages.some(m => m._id === message._id);
          if (exists) return state;

          // Deduplicate by clientMessageId (in case the ack was lost but we received the broadcast)
          if (message.clientMessageId) {
            const optimisticMatch = state.messages.find(m => m.clientMessageId === message.clientMessageId || m._id === message.clientMessageId);
            if (optimisticMatch) {
              return {
                messages: state.messages.map(m => 
                  (m.clientMessageId === message.clientMessageId || m._id === message.clientMessageId) 
                    ? { ...message, status: 'delivered' } 
                    : m
                )
              };
            }
          }
          
          const senderId = typeof message.senderId === 'object' 
            ? message.senderId._id 
            : message.senderId;
          
          if (senderId === selectedUser?._id || message.receiverId === selectedUser?._id) {
            if (senderId === selectedUser?._id) {
              setTimeout(() => {
                get().markMessageAsSeen(message._id);
                const conversation = get().conversations.find(c => c.otherUser?._id === selectedUser._id);
                if (conversation) {
                  get().markConversationAsRead(conversation._id);
                }
              }, 0);
            }
            return { messages: [...state.messages, message] };
          }
          
          return state;
        });
      },
      "message:delivered": (data) => {
        const { messages } = get();
        set({ 
          messages: messages.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, status: "delivered" }
              : msg
          )
        });
      },
      "message:seen": (data) => {
        const { messages } = get();
        set({ 
          messages: messages.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, status: "seen" }
              : msg
          )
        });
      },
      "message:edited": (data) => {
        const { messages } = get();
        set({ 
          messages: messages.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, text: data.newText, editedAt: data.editedAt }
              : msg
          )
        });
      },
      "message:deleted": (data) => {
        const { messages } = get();
        set({ 
          messages: messages.filter(msg => msg._id !== data.messageId)
        });
      },
      "typing:update": (data) => {
        const { typingUsers } = get();
        const newTypingUsers = new Set(typingUsers);
        
        if (data.isTyping) {
          newTypingUsers.add(data.userId);
        } else {
          newTypingUsers.delete(data.userId);
        }
        
        set({ typingUsers: newTypingUsers });
      },
      "user:status": (data) => {
        const { onlineUsers } = get();
        const newOnlineUsers = new Set(onlineUsers);
        
        if (data.status === "online") {
          newOnlineUsers.add(data.userId);
        } else {
          newOnlineUsers.delete(data.userId);
        }
        
        set({ onlineUsers: newOnlineUsers });
      },
      "getOnlineUsers": (users) => {
        set({ onlineUsers: new Set(users) });
      },
      "status:list": (statuses) => {
        set({ statuses });
      },
      "call:incoming": (data) => {
        set({ incomingCall: data });
        toast.info(`Incoming call from user ${data.from}`);
      },
      "call:accepted": () => {
        toast.success("Call accepted");
      },
      "call:rejected": () => {
        toast.info("Call rejected");
      },
      "error": (error) => {
        const errorMsg = error.message || "Socket error occurred";
        toast.error(errorMsg);
        set({ connectionError: errorMsg });
      },
      "conversation:updated": (data) => {
        set((state) => {
          const existing = state.conversations.find((c) => c._id === data.conversationId);
          if (existing) {
            return {
              conversations: state.conversations.map((c) =>
                c._id === data.conversationId
                  ? { ...c, lastMessage: data.lastMessage, unreadCount: data.unreadCount }
                  : c
              ),
            };
          }
          // New conversation — refresh the list
          get().getConversations();
          return state;
        });
      }
    };

    // Register handlers and store references
    const newHandlers = new Map(socketHandlers);
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
      newHandlers.set(event, handler);
    });

    set({ socketHandlers: newHandlers });
  },

  // ==================== MESSAGE ACTIONS ===================
  markMessageAsSeen: async (messageId) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("message:seen", { messageId }, (response) => {
        if (!response?.success) {
          toast.error(response?.error || "Failed to mark message as seen");
        }
      });
    }
  },

  editMessage: async (messageId, newText) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("message:edit", { messageId, newText }, (response) => {
        if (!response?.success) {
          toast.error(response?.error || "Failed to edit message");
        } else {
          toast.success("Message edited");
        }
      });
    }
  },

  deleteMessage: async (messageId) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("message:delete", { messageId }, (response) => {
        if (!response?.success) {
          toast.error(response?.error || "Failed to delete message");
        } else {
          toast.success("Message deleted");
        }
      });
    }
  },

  loadMoreMessages: async (otherUserId, page = 1) => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.emit("messages:get", { otherUserId, page, limit: 50 }, (response) => {
        if (response?.success) {
          const { messages } = get();
          if (page === 1) {
            set({ messages: response.messages });
          } else {
            set({ messages: [...response.messages, ...messages] });
          }
        } else {
          toast.error(response?.error || "Failed to load more messages");
        }
      });
    }
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    const { socketHandlers } = get();
    
    if (socket && socketHandlers.size > 0) {
      socketHandlers.forEach((handler, event) => {
        socket.off(event, handler);
      });
      set({ socketHandlers: new Map() });
    }
  },

  // UI state setters
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      const { conversations } = get();
      const conversation = conversations.find(
        (c) => c.otherUser?._id === selectedUser._id
      );
      if (conversation && conversation.unreadCount > 0) {
        get().markConversationAsRead(conversation._id);
      }
    }
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setShowStatusModal: (showStatusModal) => set({ showStatusModal }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setShowChatSearch: (showChatSearch) => set({ showChatSearch }),
  setChatSearchQuery: (chatSearchQuery) => set({ chatSearchQuery }),
  
  // Filtering
  getFilteredConversations: () => {
    const { users, searchQuery } = get();
    
    let filtered = users;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  },
}));
