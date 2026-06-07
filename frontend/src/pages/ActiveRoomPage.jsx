import { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useStreamStore } from '../store/useStreamStore';
import { useAuthStore } from '../store/useAuthStore';
import StreamRoomSidebar from '../components/organisms/StreamRoomSidebar';
import RoomHeader from '../components/organisms/RoomHeader';
import RoomMemberList from '../components/organisms/RoomMemberList';
import Avatar from '../components/atoms/Avatar';
import { Send, Radio, Paperclip } from 'lucide-react';

const ActiveRoomPage = () => {
  const { id } = useParams();
  const { authUser } = useAuthStore();
  
  const {
    activeRoom,
    activeChannel,
    activeChannelMessages,
    joinRoom,
    leaveRoom,
    sendRoomMessage
  } = useStreamStore();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Join room on mount and handle route changes
  useEffect(() => {
    if (id) {
      joinRoom(id);
    }
    return () => {
      leaveRoom();
    };
  }, [id, joinRoom, leaveRoom]);

  // Get current messages
  const currentMessages = useMemo(() => {
    if (!activeRoom || !activeChannel) return [];
    const key = `${activeRoom._id || activeRoom.id}-${activeChannel.name || activeChannel.id}`;
    return activeChannelMessages[key] || [];
  }, [activeRoom, activeChannel, activeChannelMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);

  if (!activeRoom || !activeChannel) {
    return (
      <div className="h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm font-mono uppercase tracking-widest">Aligning frequency parameters...</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendRoomMessage(activeRoom._id || activeRoom.id, activeChannel.name || activeChannel.id, messageText.trim());
    setMessageText('');
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRankBadgeClass = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'legend': return 'text-accent bg-accent/10 border-accent/25';
      case 'diamond': return 'text-cyan bg-cyan/10 border-cyan/25';
      case 'platinum': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/25';
      case 'gold': return 'text-accent-hover bg-accent-hover/10 border-accent-hover/20';
      case 'silver': return 'text-text-secondary bg-surface-200 border-default';
      default: return 'text-orange-600 bg-orange-600/10 border-orange-600/20';
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-surface flex animate-fade-in">
      {/* Col 1 — Channels & Heatmap */}
      <StreamRoomSidebar />

      {/* Col 2 — Active Room Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-100/10 h-full relative">
        <RoomHeader />

        {/* Message Logs */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-4 spatial-scrollbar"
        >
          {currentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pt-10 select-none">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/10 blur-[30px] rounded-full animate-pulse" />
                <div className="w-16 h-16 rounded-[20px] bg-accent/5 flex items-center justify-center border border-accent/10 relative z-10 animate-float">
                  <Radio className="w-7 h-7 text-accent/50" />
                </div>
              </div>
              <h3 className="text-md font-bold text-text mb-1.5">No messages yet</h3>
              <p className="text-xs text-text-muted max-w-[200px] text-center leading-relaxed">
                Start the first transmission
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentMessages.map((msg, index) => {
                const sender = msg.senderId || msg.sender;
                const senderName = sender?.fullName || "Astral Orbiter";
                const senderTier = sender?.echoTier || sender?.tier || "bronze";
                const isOwn = sender?._id === authUser?._id || sender?.id === 'me';
                const showHeader = index === 0 || (currentMessages[index - 1].senderId?._id || currentMessages[index - 1].sender?.id) !== (sender?._id || sender?.id);

                return (
                  <div key={msg._id || msg.id} className={`flex items-start gap-3.5 group ${isOwn ? 'justify-end' : ''}`}>
                    {/* Avatar (Only on header line or if not own) */}
                    {!isOwn && showHeader && (
                      <div className="shrink-0 mt-0.5">
                        <Avatar name={senderName} src={sender?.profilePic} size="sm" />
                      </div>
                    )}
                    
                    {/* Dummy padding when avatar is hidden in sequential messages */}
                    {!isOwn && !showHeader && <div className="w-8 shrink-0" />}

                    {/* Content Block */}
                    <div className={`max-w-[70%] space-y-1 ${isOwn ? 'text-right' : ''}`}>
                      {showHeader && (
                        <div className={`flex items-center gap-2 text-xxs ${isOwn ? 'justify-end' : ''}`}>
                          <span className="font-bold text-text tracking-tight">
                            {senderName}
                          </span>
                          <span className={`px-1 rounded border font-mono text-[8px] font-semibold uppercase ${getRankBadgeClass(senderTier)}`}>
                            {senderTier}
                          </span>
                          <span className="text-text-muted font-medium">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-4 py-2.5 rounded-ads-md text-xs leading-relaxed inline-block text-left shadow-elevation-1 transition-all duration-200 border ${
                          isOwn
                            ? 'bg-gradient-to-br from-accent to-accent-hover text-surface border-accent-hover shadow-glow-accent/10'
                            : 'bg-surface-100/90 text-text border-default group-hover:border-border-hover'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSendMessage}
          className="p-4 bg-surface border-t border-default shrink-0"
        >
          <div className="flex items-center gap-2.5 bg-surface-100 rounded-ads-md border border-default focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/5 px-4 py-2.5 transition-all duration-200">
            <button 
              type="button"
              className="text-text-muted hover:text-text transition-colors shrink-0"
              title="Add attachment"
            >
              <Paperclip size={16} />
            </button>
            <input
              type="text"
              placeholder={`Send frequency spike to #${activeChannel.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-transparent border-none text-text placeholder-text-muted text-base md:text-xs outline-none"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                disabled={!messageText.trim()}
                className={`p-1.5 rounded-ads-sm transition-all duration-200 ${
                  messageText.trim()
                    ? 'bg-accent text-surface shadow-glow-accent/15 hover:scale-105 active:scale-95'
                    : 'text-text-disabled cursor-not-allowed'
                }`}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Col 3 — Active Room Member List */}
      <RoomMemberList />
    </div>
  );
};

export default ActiveRoomPage;
