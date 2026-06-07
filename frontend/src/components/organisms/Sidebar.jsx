import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/useChatStore';
import { useFriendStore } from '../../store/useFriendStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import IconButton from '../atoms/IconButton';
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
      <aside className="h-full w-20 lg:w-[320px] flex flex-col border-r border-default bg-surface/40 backdrop-blur-md">
        <div className="p-4 border-b border-default">
          <div className="space-y-3">
            <div className="h-5 w-24 rounded-md bg-surface-elevated animate-pulse" />
            <div className="h-10 rounded-xl bg-surface-elevated animate-pulse" />
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
              <div className="w-11 h-11 rounded-full bg-surface-elevated animate-pulse flex-shrink-0" />
              <div className="flex-1 hidden lg:block space-y-2">
                <div className="h-4 w-28 rounded bg-surface-elevated animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-elevated animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-20 lg:w-[320px] flex flex-col border-r border-default bg-surface/40 backdrop-blur-md">
      <div className="p-4 border-b border-default space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-text hidden lg:block tracking-tight text-sm">Inbox</span>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => openCommandPalette()}
            title="Command Palette (Ctrl+K)"
            aria-label="Command Palette"
          >
            <UserPlus className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="hidden lg:flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 ease-spatial ${
                activeTab === tab.id
                  ? 'bg-surface-elevated text-primary border border-border-active shadow-spatial-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface border border-transparent'
              }`}
            >
              <tab.icon size={13} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span>{tab.label}</span>
              {tab.count > 0 && <Badge variant="solid" size="xs" className="ml-0.5">{tab.count}</Badge>}
            </button>
          ))}
        </div>

        {hasContent && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-surface border border-default text-text focus:outline-none focus:border-border-active transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto spatial-scrollbar py-2">
        {activeTab === 'chats' && (
          <>
            {filteredConversations.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Add friends to start secure, real-time messaging."
                action={{ label: 'Find People', icon: UserPlus, onClick: () => openCommandPalette() }}
              />
            ) : (
              <div className="px-2 space-y-1">
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
                      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-300 ease-spatial group ${
                        isSelected ? 'bg-surface-elevated border border-border-active shadow-spatial-sm' : 'hover:bg-surface border border-transparent'
                      }`}
                    >
                      <Avatar
                        src={user.profilePic}
                        name={user.fullName}
                        size="md"
                        online={isOnline}
                      />

                      <div className="text-left min-w-0 flex-1 hidden lg:block">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-[13px] truncate ${isSelected ? 'text-text' : 'text-text-secondary'}`}>
                            {conv.isPinned && <Pin size={11} className="inline mr-1.5 text-text-muted" />}
                            {user.fullName}
                          </span>
                          <span className="text-[10px] text-text-muted ml-2 flex-shrink-0 font-medium">
                            {formatTime(conv.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-text-muted truncate max-w-[160px]">
                            {conv.lastMessage?.text || 'Start a conversation'}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="solid" size="xs" className="ml-2 flex-shrink-0">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </Badge>
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
                description="Search for people and send them a friend request."
                action={{ label: 'Find People', icon: UserPlus, onClick: () => openCommandPalette() }}
              />
            ) : (
              <div className="px-2 space-y-1">
                {filteredFriends.map((user) => {
                  const isOnline = onlineUsersSet.has(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => { navigate(`/messages/${user._id}`); setActiveTab('chats'); }}
                      className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-surface border border-transparent transition-all duration-300 group"
                    >
                      <Avatar src={user.profilePic} name={user.fullName} size="sm" online={isOnline} />
                      <div className="text-left min-w-0 flex-1 hidden lg:block">
                        <div className="text-[13px] font-medium text-text-secondary truncate group-hover:text-text transition-colors">{user.fullName}</div>
                        <div className="text-[11px] text-text-muted">{isOnline ? 'Online' : 'Offline'}</div>
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
                description="When someone sends you a friend request or signal, it will appear here."
              />
            ) : (
              <div className="px-2 space-y-2">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="p-3 rounded-xl bg-surface border border-default shadow-inner-light">
                    <div className="flex items-center gap-3">
                      <Avatar src={request.user.profilePic} name={request.user.fullName} size="sm" />
                      <div className="flex-1 min-w-0 hidden lg:block">
                        <div className="text-[13px] font-medium text-text truncate">{request.user.fullName}</div>
                        <div className="text-xs text-text-muted mt-0.5">Wants to connect</div>
                      </div>
                    </div>
                    <div className="gap-2 mt-3 hidden lg:flex">
                      <button
                        onClick={() => acceptFriendRequest(request.user._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-surface-base text-xs font-medium hover:bg-primary-hover shadow-spatial-sm transition-all active:scale-[0.98]"
                      >
                        <Check size={14} strokeWidth={2.5} /> Accept
                      </button>
                      <button
                        onClick={() => declineFriendRequest(request.user._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-elevated text-text-secondary text-xs font-medium hover:bg-surface-highlight border border-default transition-all active:scale-[0.98]"
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

      {contextMenu && (
        <div
          className="fixed spatial-card py-1 shadow-elevation-3 z-50 min-w-[140px] animate-scale-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => { pinConversation(contextMenu.conversation._id); setContextMenu(null); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-surface transition-colors"
          >
            <Pin size={13} />
            {contextMenu.conversation.isPinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      )}

    </aside>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 rounded-2xl bg-surface border border-default flex items-center justify-center mb-6 shadow-inner-light">
      <Icon className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
    </div>
    <p className="text-[15px] font-medium text-text mb-1">{title}</p>
    <p className="text-[13px] text-text-muted mb-6 max-w-[200px] leading-relaxed">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-elevated border border-default text-xs font-medium text-text hover:bg-surface-highlight transition-all duration-300 shadow-spatial-sm active:scale-[0.98]"
      >
        <action.icon size={14} />
        {action.label}
      </button>
    )}
  </div>
);

export default Sidebar;
