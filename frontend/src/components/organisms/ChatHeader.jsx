import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useFriendStore } from '../../store/useFriendStore';
import Avatar from '../atoms/Avatar';
import IconButton from '../atoms/IconButton';
import {
  Phone, Search, X, Video, ArrowLeft,
  MoreVertical, UserMinus, Ban,
} from 'lucide-react';

const ChatHeader = () => {
  const {
    selectedUser, showChatSearch, setShowChatSearch,
    chatSearchQuery, setChatSearchQuery, setSelectedUser,
  } = useChatStore();
  const { onlineUsers } = useChatStore();
  const { removeFriend, blockUser } = useFriendStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  if (!selectedUser) return null;

  const isUserOnline = onlineUsers.has(selectedUser._id);

  const toggleChatSearch = () => {
    setShowChatSearch(!showChatSearch);
    if (showChatSearch) setChatSearchQuery('');
  };

  return (
    <div className="bg-surface/40 backdrop-blur-xl px-5 py-3.5 border-b border-default rounded-t-2xl z-10 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left — User info */}
        <div className="flex items-center gap-3">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUser(null)}
            className="lg:hidden"
            aria-label="Back to chat list"
          >
            <ArrowLeft size={18} />
          </IconButton>

          <Avatar
            src={selectedUser.profilePic}
            name={selectedUser.fullName}
            size="sm"
            online={isUserOnline}
          />

          <div>
            <div className="font-medium text-text text-sm tracking-tight">{selectedUser.fullName}</div>
            <div className="text-xs flex items-center gap-1.5 mt-0.5">
              {isUserOnline ? (
                <span className="text-emerald font-medium">Online</span>
              ) : (
                <span className="text-text-muted">Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1">
          {showChatSearch && (
            <div className="flex items-center gap-2 w-48 lg:w-64 animate-slide-left mr-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-surface border border-default text-text focus:outline-none focus:border-border-active transition-all"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <IconButton variant="ghost" size="xs" onClick={toggleChatSearch} aria-label="Close search">
                <X size={14} />
              </IconButton>
            </div>
          )}

          <IconButton variant="ghost" disabled title="Voice call (Coming soon)" aria-label="Voice call">
            <Phone size={17} />
          </IconButton>

          <IconButton variant="ghost" disabled title="Video call (Coming soon)" aria-label="Video call">
            <Video size={17} />
          </IconButton>

          <IconButton variant="ghost" onClick={toggleChatSearch} title="Search messages" aria-label="Search messages">
            <Search size={17} />
          </IconButton>

          {/* More menu */}
          <div className="relative" ref={menuRef}>
            <IconButton
              variant="ghost"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
              aria-expanded={showMenu}
            >
              <MoreVertical size={17} />
            </IconButton>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 spatial-card py-1 z-50 min-w-[160px] animate-scale-in">
                <button
                  onClick={() => { removeFriend(selectedUser._id); setSelectedUser(null); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-text-secondary hover:bg-surface hover:text-text transition-colors"
                >
                  <UserMinus size={14} /> Unfriend
                </button>
                <button
                  onClick={() => { blockUser(selectedUser._id); setSelectedUser(null); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose hover:bg-rose/10 transition-colors"
                >
                  <Ban size={14} /> Block User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
