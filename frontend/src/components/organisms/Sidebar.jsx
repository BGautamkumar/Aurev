import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { useFriendStore } from '../../store/useFriendStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import Avatar from '../atoms/Avatar';
import {
  Search, Users, MessageSquare, UserPlus, Bell,
  Check, X, Pin
} from 'lucide-react';

const Sidebar = () => {
  const {
    selectedUser, isUsersLoading,
    searchQuery, setSearchQuery,
    conversations, getConversations,
    pinConversation,
  } = useChatStore();
  const {
    friends, pendingRequests,
    getFriends, getPendingRequests,
    acceptFriendRequest, declineFriendRequest,
    subscribeToFriendEvents, unsubscribeFromFriendEvents,
  } = useFriendStore();
  const { socket } = useAuthStore();
  const onlineUsersSet = useChatStore((s) => s.onlineUsers);
  const { openCommandPalette } = useUIStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');
  const [contextMenu, setContextMenu] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    getConversations();
    getFriends();
    getPendingRequests();
  }, [getConversations, getFriends, getPendingRequests]);

  useEffect(() => {
    if (socket) {
      subscribeToFriendEvents(socket);
      return () => unsubscribeFromFriendEvents(socket);
    }
  }, [socket, subscribeToFriendEvents, unsubscribeFromFriendEvents]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const handleContextMenu = (e, conversation) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, conversation });
  };

  const filteredConversations = conversations.filter((conv) =>
    !searchQuery || conv.otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter((f) =>
    !searchQuery || f.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const hasContent =
    (activeTab === 'chats' && conversations.length > 0) ||
    (activeTab === 'friends' && friends.length > 0) ||
    (activeTab === 'requests' && pendingRequests.length > 0);

  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, count: conversations.filter((c) => c.unreadCount > 0).length },
    { id: 'friends', label: 'Friends', icon: Users, count: 0 },
    { id: 'requests', label: 'Requests', icon: Bell, count: pendingRequests.length },
  ];

  if (isUsersLoading) {
    return (
      <aside className="h-full w-20 lg:w-[320px] flex flex-col" style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="space-y-3">
            <div className="h-5 w-24 rounded-md animate-pulse" style={{ background: 'var(--elevated)' }} />
            <div className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--elevated)' }} />
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
              <div className="w-11 h-11 rounded-full animate-pulse flex-shrink-0" style={{ background: 'var(--elevated)' }} />
              <div className="flex-1 hidden lg:block space-y-2">
                <div className="h-4 w-28 rounded animate-pulse" style={{ background: 'var(--elevated)' }} />
                <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--elevated)' }} />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-20 lg:w-[320px] flex flex-col" style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
      {/* Header */}
      <div className="p-4 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xl hidden lg:block tracking-tight" style={{ color: 'var(--text-primary)' }}>Inbox</span>
          <button
            onClick={() => openCommandPalette()}
            title="Add Friend (Ctrl+K)"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-fast hover:bg-white/[0.04] active:scale-[0.92]"
            style={{ color: 'var(--text-muted)' }}
          >
            <UserPlus className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="hidden lg:flex gap-1 relative" style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', padding: '3px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-normal relative"
              style={{
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                boxShadow: activeTab === tab.id ? 'var(--shadow-spatial-sm)' : 'none',
              }}
            >
              <tab.icon size={13} strokeWidth={activeTab === tab.id ? 2.2 : 1.8} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className="min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold rounded-full px-1"
                  style={{
                    background: 'var(--accent-base)',
                    color: 'var(--white-pure)',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        {hasContent && (
          <div className="relative hidden lg:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-fast"
              style={{ color: searchFocused ? 'var(--text-primary)' : 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none transition-all duration-fast"
              style={{
                background: 'var(--elevated)',
                border: searchFocused ? '1px solid var(--border-lit)' : '1px solid var(--border)',
                color: 'var(--text-primary)',
                boxShadow: searchFocused ? 'inset 3px 0 0 var(--accent-base), 0 0 0 2px var(--accent-subtle)' : 'none',
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto charged-scrollbar py-2">
        {activeTab === 'chats' && (
          <>
            {filteredConversations.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No echoes yet"
                description="Find people and start transmitting."
                action={{ label: 'Find People', icon: UserPlus, onClick: () => openCommandPalette() }}
              />
            ) : (
              <div className="px-2 space-y-0.5">
                {filteredConversations.map((conv) => {
                  const user = conv.otherUser;
                  if (!user) return null;
                  const isSelected = selectedUser?._id === user._id;
                  const isOnline = onlineUsersSet.has(user._id);

                  return (
                    <button
                      key={conv._id}
                      onClick={() => navigate(`/messages/${user._id}`)}
                      onContextMenu={(e) => handleContextMenu(e, conv)}
                      className="w-full flex items-center gap-3 rounded-xl transition-all duration-fast group relative"
                      style={{
                        padding: '10px 12px',
                        background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--accent-base)' : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'var(--elevated)';
                          e.currentTarget.style.borderLeftColor = 'var(--border-mid)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderLeftColor = 'transparent';
                        }
                      }}
                    >
                      {/* Ambient glow for selected */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--accent-subtle), transparent)' }} />
                      )}

                      <div className="relative z-10 transition-transform duration-fast group-hover:scale-[1.05]">
                        <Avatar
                          src={user.profilePic}
                          name={user.fullName}
                          size="md"
                          online={isOnline}
                        />
                      </div>

                      <div className="text-left min-w-0 flex-1 hidden lg:block relative z-10">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-[13px] truncate ${isSelected ? 'text-white-pure' : 'text-white-soft'}`}>
                            {conv.isPinned && <Pin size={10} className="inline mr-1.5 text-text-muted" />}
                            {user.fullName}
                          </span>
                          <span className="text-[10px] ml-2 flex-shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>
                            {formatTime(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs truncate max-w-[170px]" style={{ color: 'var(--text-secondary)' }}>
                            {conv.lastMessage?.text || 'Start a conversation'}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span
                              className="min-w-[20px] h-[20px] flex items-center justify-center text-[10px] font-bold rounded-full px-1.5 ml-2 flex-shrink-0 font-mono"
                              style={{
                                background: 'var(--accent-base)',
                                color: 'var(--white-pure)',
                                boxShadow: '0 0 8px var(--accent-subtle)',
                              }}
                            >
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'friends' && (
          <>
            {filteredFriends.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No friends yet"
                description="Search for people and send them a connect request."
                action={{ label: 'Find People', icon: UserPlus, onClick: () => openCommandPalette() }}
              />
            ) : (
              <div className="px-2 space-y-0.5">
                {filteredFriends.map((user) => {
                  const isOnline = onlineUsersSet.has(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => { navigate(`/messages/${user._id}`); setActiveTab('chats'); }}
                      className="w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-fast group"
                      style={{ borderLeft: '3px solid transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--elevated)';
                        e.currentTarget.style.borderLeftColor = 'var(--border-mid)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }}
                    >
                      <Avatar src={user.profilePic} name={user.fullName} size="sm" online={isOnline} />
                      <div className="text-left min-w-0 flex-1 hidden lg:block">
                        <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{user.fullName}</div>
                        <div className="text-[11px]" style={{ color: isOnline ? 'var(--online)' : 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No signals received"
                description="When someone sends you a connect request, it will appear here."
              />
            ) : (
              <div className="px-2 space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-3 rounded-xl"
                    style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={request.user.profilePic} name={request.user.fullName} size="sm" />
                      <div className="flex-1 min-w-0 hidden lg:block">
                        <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{request.user.fullName}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Wants to connect</div>
                      </div>
                    </div>
                    <div className="gap-2 mt-3 hidden lg:flex">
                      <button
                        onClick={() => acceptFriendRequest(request.user._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.96]"
                        style={{ background: 'var(--accent-base)', color: 'var(--white-pure)' }}
                      >
                        <Check size={14} strokeWidth={2.5} /> Accept
                      </button>
                      <button
                        onClick={() => declineFriendRequest(request.user._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.96]"
                        style={{ background: 'var(--overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      >
                        <X size={14} strokeWidth={2} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed py-1 z-50 min-w-[140px] animate-scale-in"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--overlay)',
            border: '1px solid var(--border-lit)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          }}
        >
          <button
            onClick={() => { pinConversation(contextMenu.conversation._id); setContextMenu(null); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Pin size={13} />
            {contextMenu.conversation.isPinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      )}
    </aside>
  );
};

/* ── Empty State ── */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    {/* Animated rings behind icon */}
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-strong)' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.7s' }}>
        <div className="w-20 h-20 rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-subtle)', animationDelay: '0.7s' }} />
      </div>
      <div
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-spatial-sm)' }}
      >
        <Icon className="w-7 h-7" strokeWidth={1.5} style={{ color: 'var(--accent-base)' }} />
      </div>
    </div>

    <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
    <p className="text-[13px] mb-6 max-w-[200px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>

    {action && (
      <button
        onClick={action.onClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-fast active:scale-[0.96]"
        style={{
          background: 'var(--accent-base)',
          color: 'var(--white-pure)',
          boxShadow: '0 4px 16px var(--accent-subtle)',
        }}
      >
        <action.icon size={14} />
        {action.label}
      </button>
    )}
  </div>
);

export default Sidebar;
