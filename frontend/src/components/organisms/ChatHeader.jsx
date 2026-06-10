import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFriendStore } from '../../store/useFriendStore';
import Avatar from '../atoms/Avatar';
import {
  Phone, Search, X, Video, ArrowLeft,
  MoreVertical, UserMinus, Ban,
} from 'lucide-react';

const ChatHeader = () => {
  const {
    selectedUser, showChatSearch, setShowChatSearch,
    chatSearchQuery, setChatSearchQuery, setSelectedUser,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { removeFriend, blockUser } = useFriendStore();
  const [showMenu, setShowMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  if (!selectedUser) return null;

  const isUserOnline = onlineUsers.includes(selectedUser._id);

  const toggleChatSearch = () => {
    setShowChatSearch(!showChatSearch);
    if (showChatSearch) setChatSearchQuery('');
  };

  const IconBtn = ({ onClick, title, disabled, children }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-fast"
      style={{
        background: 'transparent',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = disabled ? 'var(--text-muted)' : 'var(--text-secondary)'; }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="flex items-center justify-between z-10 flex-shrink-0"
      style={{
        background: 'var(--glass-background)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        height: 64,
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile back */}
        <button
          className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
          onClick={() => setSelectedUser(null)}
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Avatar */}
        <div className="relative">
          <div
            className="w-[38px] h-[38px] rounded-full overflow-hidden"
            style={{ border: '2px solid var(--border)' }}
          >
            <Avatar src={selectedUser.profilePic} name={selectedUser.fullName} size="sm" online={false} />
          </div>
        </div>

        <div>
          <div className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
            {selectedUser.fullName}
          </div>
          <div className="text-[11px] font-medium" style={{ color: isUserOnline ? 'var(--online)' : 'var(--text-muted)' }}>
            {isUserOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {showChatSearch && (
          <div className="flex items-center gap-2 mr-2 animate-slide-in-left" style={{ width: 200 }}>
            <div
              className="flex-1 flex items-center gap-2 h-8 px-2.5 rounded-lg transition-all duration-fast"
              style={{
                background: 'var(--elevated)',
                border: searchFocused ? '1px solid var(--accent-hover)' : '1px solid var(--border)',
              }}
            >
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search messages..."
                value={chatSearchQuery}
                onChange={e => setChatSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <button onClick={toggleChatSearch} style={{ color: 'var(--text-muted)', padding: 4 }}>
              <X size={14} />
            </button>
          </div>
        )}

        <IconBtn title="Voice call (Coming soon)" disabled><Phone size={17} /></IconBtn>
        <IconBtn title="Video call (Coming soon)" disabled><Video size={17} /></IconBtn>
        <IconBtn onClick={toggleChatSearch} title="Search messages"><Search size={17} /></IconBtn>

        {/* More menu */}
        <div className="relative" ref={menuRef}>
          <IconBtn onClick={() => setShowMenu(!showMenu)}><MoreVertical size={17} /></IconBtn>
          {showMenu && (
            <div
              className="absolute right-0 py-1 z-[100] min-w-[160px] animate-scale-in"
              style={{
                top: 'calc(100% + 8px)',
                background: 'var(--elevated)',
                border: '1px solid var(--border-lit)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              }}
            >
              <MenuBtn onClick={() => { removeFriend(selectedUser._id); setSelectedUser(null); setShowMenu(false); }}>
                <UserMinus size={14} /> Unfriend
              </MenuBtn>
              <MenuBtn
                onClick={() => { blockUser(selectedUser._id); setSelectedUser(null); setShowMenu(false); }}
                danger
              >
                <Ban size={14} /> Block User
              </MenuBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuBtn = ({ onClick, danger, children }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-all duration-fast"
    style={{
      color: danger ? 'var(--danger)' : 'var(--text-secondary)',
      borderRadius: 6,
      fontFamily: 'Inter, sans-serif',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'var(--overlay)';
      if (!danger) e.currentTarget.style.color = 'var(--text-primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-secondary)';
    }}
  >
    {children}
  </button>
);

export { MenuBtn };
export default ChatHeader;
