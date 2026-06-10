import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useFriendStore } from '../../store/useFriendStore';
import { useChatStore } from '../../store/useChatStore';
import Avatar from '../atoms/Avatar';
import {
  Search, Settings, User, Compass, Trophy, LogOut,
  Moon, Sun, Users, Plus, Clock, X, MessageSquare
} from 'lucide-react';

const CommandPalette = () => {
  const { isCommandPaletteOpen, closeCommandPalette } = useUIStore();
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { searchResults, searchUsers, clearSearch, sendFriendRequest } = useFriendStore();
  const { setSelectedUser } = useChatStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      clearSearch();
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen, clearSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length >= 2) searchUsers(query.trim());
      else clearSearch();
      setSelectedIndex(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, searchUsers, clearSearch]);

  const handleClose = () => closeCommandPalette();

  const navigationCommands = React.useMemo(() => [
    { id: 'nav-home', label: 'Go to Chat', icon: MessageSquare, type: 'command', action: () => navigate('/') },
    { id: 'nav-rooms', label: 'Go to Frequencies (Rooms)', icon: Compass, type: 'command', action: () => navigate('/rooms') },
    { id: 'nav-aurevrank', label: 'Go to Aurev Rank', icon: Trophy, type: 'command', action: () => navigate('/aurev-rank') },
    { id: 'nav-settings', label: 'Go to Settings', icon: Settings, type: 'command', action: () => navigate('/settings') },
    { id: 'nav-profile', label: 'Go to Profile', icon: User, type: 'command', action: () => navigate('/profile') },
  ], [navigate]);

  const actionCommands = React.useMemo(() => [
    {
      id: 'action-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: theme === 'dark' ? Sun : Moon,
      type: 'command',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark')
    },
    { id: 'action-logout', label: 'Log Out', icon: LogOut, type: 'command', action: () => { logout(); navigate('/login'); }, destructive: true },
  ], [theme, setTheme, logout, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredNavCommands = React.useMemo(() => navigationCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), [query, navigationCommands]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredActionCommands = React.useMemo(() => actionCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), [query, theme, actionCommands]);

  const allItems = React.useMemo(() => [
    ...filteredNavCommands,
    ...filteredActionCommands,
    ...(searchResults || []).map(u => ({ ...u, type: 'user' }))
  ], [filteredNavCommands, filteredActionCommands, searchResults]);

  const executeAction = (item) => {
    if (!item) return;
    if (item.type === 'command') {
      item.action();
      handleClose();
    } else if (item.type === 'user') {
      if (item.friendshipStatus === 'accepted') {
        setSelectedUser(item);
        navigate('/');
        handleClose();
      } else if (item.friendshipStatus !== 'pending' && item._id !== authUser?._id) {
        sendFriendRequest(item._id);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isCommandPaletteOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeAction(allItems[selectedIndex]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommandPaletteOpen, allItems, selectedIndex]);

  const renderUserAction = (user) => {
    if (user._id === authUser?._id) return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>You</span>;
    if (user.friendshipStatus === 'accepted') {
      return (
        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md" style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.1)' }}>
          <MessageSquare size={12} /> Chat
        </span>
      );
    }
    if (user.friendshipStatus === 'pending') {
      return (
        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md" style={{ color: 'var(--text-muted)', background: 'var(--overlay)' }}>
          <Clock size={12} /> Pending
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md" style={{ color: 'var(--accent-base)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-strong)' }}>
        <Plus size={12} /> Add
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-safe md:pt-[15vh] px-4"
          style={{
            background: 'rgba(5, 5, 5, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            className="w-full max-w-2xl mt-4 md:mt-0 overflow-hidden flex flex-col max-h-[70vh]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
            exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search users or type a command..."
                className="flex-1 bg-transparent text-base outline-none font-medium"
                style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--elevated)', border: '1px solid var(--border)' }}>ESC</span>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto charged-scrollbar py-2">
              {allItems.length === 0 && (
                <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No results found for &quot;{query}&quot;
                </div>
              )}

              {filteredNavCommands.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Navigation</div>
                  {filteredNavCommands.map((item) => {
                    const index = allItems.indexOf(item);
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                        style={{
                          background: isSelected ? 'var(--elevated)' : 'transparent',
                          borderLeft: isSelected ? '2px solid var(--accent-base)' : '2px solid transparent',
                        }}
                        onClick={() => executeAction(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <item.icon size={16} style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredActionCommands.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Actions</div>
                  {filteredActionCommands.map((item) => {
                    const index = allItems.indexOf(item);
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                        style={{
                          background: isSelected ? 'var(--elevated)' : 'transparent',
                          borderLeft: isSelected ? '2px solid var(--accent-base)' : '2px solid transparent',
                        }}
                        onClick={() => executeAction(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <item.icon size={16} style={{ color: isSelected ? (item.destructive ? 'var(--danger)' : 'var(--text-primary)') : 'var(--text-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: isSelected ? (item.destructive ? 'var(--danger)' : 'var(--text-primary)') : 'var(--text-secondary)' }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <Users size={12} /> Orbital Network
                  </div>
                  {searchResults.map((user) => {
                    const userItem = allItems.find(i => i.type === 'user' && i._id === user._id);
                    const index = allItems.indexOf(userItem);
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors"
                        style={{
                          background: isSelected ? 'var(--elevated)' : 'transparent',
                          borderLeft: isSelected ? '2px solid var(--accent-base)' : '2px solid transparent',
                        }}
                        onClick={() => executeAction(userItem)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={user.profilePic} name={user.fullName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{user.fullName}</div>
                            <div className="text-xs truncate font-mono" style={{ color: 'var(--text-muted)' }}>@{user.username}</div>
                          </div>
                        </div>
                        <div>{renderUserAction(user)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center gap-4 text-[10px] font-mono" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}>↑↓</span> to navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}>↵</span> to select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
