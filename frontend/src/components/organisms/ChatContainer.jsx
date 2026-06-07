import { useEffect, useState, useMemo, memo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageBubble from '../molecules/MessageBubble';
import { RefreshCw, WifiOff, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import Spinner from '../atoms/Spinner';
import Button from '../atoms/Button';

const getDateLabel = (messageDate) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const md = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  if (md.getTime() === td.getTime()) return 'Today';
  if (md.getTime() === yd.getTime()) return 'Yesterday';
  return messageDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

const ChatContainer = memo(() => {
  const {
    messages, selectedUser, isMessagesLoading, connectionError,
    loadMessages, subscribeToMessages, unsubscribeFromMessages,
    joinChatRoom, leaveChatRoom, chatSearchQuery,
  } = useChatStore();
  const [stickyDate, setStickyDate] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      joinChatRoom(selectedUser._id);
      loadMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => {
      if (selectedUser) leaveChatRoom(selectedUser._id);
      unsubscribeFromMessages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?._id]);

  const filteredMessages = useMemo(() =>
    chatSearchQuery
      ? messages.filter((msg) => msg.text?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      : messages,
  [messages, chatSearchQuery]);

  const messageGroups = useMemo(() => {
    const groups = [];
    let lastDateKey = null;
    filteredMessages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);
      const dateKey = messageDate.toDateString();
      if (dateKey !== lastDateKey) {
        groups.push({ type: 'date', date: getDateLabel(messageDate), dateKey });
        lastDateKey = dateKey;
      }
      let isConsecutive = false;
      if (index > 0) {
        const prev = filteredMessages[index - 1];
        const prevSenderId = typeof prev.senderId === 'object' ? prev.senderId._id : prev.senderId;
        const currSenderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
        isConsecutive = currSenderId === prevSenderId &&
          (new Date(message.createdAt) - new Date(prev.createdAt)) < 300000;
      }
      groups.push({ type: 'message', message, isConsecutive });
    });
    return groups;
  }, [filteredMessages]);

  const handleRangeChanged = (range) => {
    // Find the most recent date label above or at the current visible start index
    let i = range.startIndex;
    while (i >= 0) {
      if (messageGroups[i] && messageGroups[i].type === 'date') {
        setStickyDate(messageGroups[i].date);
        return;
      }
      i--;
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <div>
              <p className="text-text-secondary text-sm font-medium">Loading messages...</p>
            </div>
          </div>
        </div>
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) return null;

  if (connectionError && !isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
        <ChatHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 rounded-2xl bg-rose/10 flex items-center justify-center mx-auto">
              <WifiOff className="w-10 h-10 text-rose" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text">Connection Error</h3>
              <p className="text-sm text-text-muted mt-1">{connectionError}</p>
            </div>
            <Button variant="primary" icon={<RefreshCw size={16} />} onClick={() => loadMessages(selectedUser._id)}>
              Retry
            </Button>
          </div>
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative">
      <ChatHeader />

      <div className="flex-1 relative overflow-hidden">
        {/* Sticky Date */}
        <AnimatePresence>
          {stickyDate && filteredMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-0 left-0 w-full z-10 flex justify-center py-2 pointer-events-none"
            >
              <div className="text-[11px] text-text-secondary bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full font-medium border border-default shadow-sm">
                {stickyDate}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full pt-20">
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-default flex items-center justify-center mx-auto shadow-inner-light">
                <MessageSquare className="w-8 h-8 text-text-muted" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-medium text-text">No messages yet</h3>
                <p className="text-xs text-text-muted mt-1">Start the conversation with {selectedUser?.fullName}</p>
              </div>
            </div>
          </div>
        ) : (
          <Virtuoso
            className="spatial-scrollbar"
            style={{ height: '100%' }}
            data={messageGroups}
            initialTopMostItemIndex={messageGroups.length - 1}
            followOutput="smooth"
            rangeChanged={handleRangeChanged}
            itemContent={(index, group) => {
              if (group.type === 'date') {
                return (
                  <div className="flex justify-center py-4">
                    <div className="text-[11px] text-text-muted bg-surface/50 border border-default px-3 py-1 rounded-full font-medium">
                      {group.date}
                    </div>
                  </div>
                );
              }
              return (
                <div className="px-5 pb-0.5">
                  <MessageBubble message={group.message} isConsecutive={group.isConsecutive} />
                </div>
              );
            }}
          />
        )}
      </div>

      <MessageInput />
    </div>
  );
});

ChatContainer.displayName = 'ChatContainer';
export default ChatContainer;
