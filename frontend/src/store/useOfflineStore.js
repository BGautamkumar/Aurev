import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOfflineStore = create(
  persist(
    (set, get) => ({
      // Offline state
      isOnline: navigator.onLine,
      pendingMessages: [],
      failedMessages: [],
      
      // Actions
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        // If coming back online, retry pending messages
        if (isOnline) {
          get().retryPendingMessages();
        }
      },
      
      addPendingMessage: (message) => {
        set((state) => ({
          pendingMessages: [...state.pendingMessages, { ...message, timestamp: Date.now() }]
        }));
      },
      
      removePendingMessage: (messageId) => {
        set((state) => ({
          pendingMessages: state.pendingMessages.filter(m => m._id !== messageId)
        }));
      },
      
      addFailedMessage: (message) => {
        set((state) => ({
          failedMessages: [...state.failedMessages, { ...message, timestamp: Date.now() }],
          pendingMessages: state.pendingMessages.filter(m => m._id !== message._id)
        }));
      },
      
      retryPendingMessages: () => {
        const { pendingMessages } = get();
        if (pendingMessages.length === 0) return;
        
        // Import here to avoid circular dependency
        import('./useChatStore.js').then(({ useChatStore }) => {
          const { resendPendingMessage } = useChatStore.getState();
          pendingMessages.forEach(message => {
            resendPendingMessage(message);
          });
        });
      },
      
      clearFailedMessages: () => {
        set({ failedMessages: [] });
      },
      
      // Initialize online status listener
      init: () => {
        const handleOnline = () => get().setOnlineStatus(true);
        const handleOffline = () => get().setOnlineStatus(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Set initial status
        get().setOnlineStatus(navigator.onLine);
        
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({
        pendingMessages: state.pendingMessages,
        failedMessages: state.failedMessages
      })
    }
  )
);
