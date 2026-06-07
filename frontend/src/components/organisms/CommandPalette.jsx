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

  // Focus trap and scroll lock
  useEffect(() => {
    if (isCommandPaletteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      clearSearch();
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen, clearSearch]);

  // Handle Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length >= 2) searchUsers(query.trim());
      else clearSearch();
      setSelectedIndex(0); // Reset selection on new search
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, searchUsers, clearSearch]);

  const handleClose = () => {
    closeCommandPalette();
  };

  // Commands
  const navigationCommands = [
    { id: 'nav-home', label: 'Go to Chat', icon: MessageSquare, action: () => navigate('/') },
    { id: 'nav-rooms', label: 'Go to Frequencies (Rooms)', icon: Compass, action: () => navigate('/rooms') },
    { id: 'nav-echorank', label: 'Go to Echo Rank', icon: Trophy, action: () => navigate('/echorank') },
    { id: 'nav-settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings') },
    { id: 'nav-profile', label: 'Go to Profile', icon: User, action: () => navigate('/profile') },
  ];

  const actionCommands = [
    { 
      id: 'action-theme', 
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
      icon: theme === 'dark' ? Sun : Moon, 
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark') 
    },
    { id: 'action-logout', label: 'Log Out', icon: LogOut, action: () => { logout(); navigate('/login'); }, destructive: true },
  ];

  // Filter commands based on query
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredNavCommands = React.useMemo(() => navigationCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), [query]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredActionCommands = React.useMemo(() => actionCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), [query, theme]);

  // Flatten items for keyboard navigation using useMemo to prevent unnecessary array creation
  const allItems = React.useMemo(() => [
    ...filteredNavCommands.map(c => ({ ...c, type: 'command' })),
    ...filteredActionCommands.map(c => ({ ...c, type: 'command' })),
    ...(searchResults || []).map(u => ({ ...u, type: 'user' }))
  ], [filteredNavCommands, filteredActionCommands, searchResults]);

  const executeAction = (item) => {
    if (!item) return;
    
    if (item.type === 'command') {
      item.action();
      handleClose();
    } else if (item.type === 'user') {
      // User action: Chat if friend, otherwise request
      if (item.friendshipStatus === 'accepted') {
        setSelectedUser(item);
        navigate('/');
        handleClose();
      } else if (item.friendshipStatus !== 'pending' && item._id !== authUser?._id) {
        sendFriendRequest(item._id);
      }
    }
  };

  // Keyboard navigation
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

  // Framer Motion Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }
  };


  const renderUserAction = (user) => {
    if (user._id === authUser?._id) return <span className="text-xs text-text-muted">You</span>;
    if (user.friendshipStatus === 'accepted') {
      return <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-emerald px-2.5 py-1 rounded-sm bg-emerald/10"><MessageSquare size={12} /> Chat</span>;
    }
    if (user.friendshipStatus === 'pending') {
      return <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-text-muted px-2.5 py-1 rounded-sm bg-surface-200"><Clock size={12} /> Pending</span>;
    }
    return (
      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-accent px-2.5 py-1 rounded-sm bg-accent/10 border border-accent/20">
        <Plus size={12} /> Add
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-safe md:pt-[15vh] px-4 bg-surface-base/60 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            className="w-full max-w-2xl mt-4 md:mt-0 bg-surface border border-default shadow-elevation-3 rounded-2xl overflow-hidden flex flex-col max-h-[70vh] md:max-h-[70vh]"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-default bg-surface/80">
            <Search className="w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search users or type a command..."
              className="flex-1 bg-transparent text-text text-base outline-none placeholder-text-muted font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted border border-default px-1.5 py-0.5 rounded bg-surface-200">ESC</span>
              <button onClick={handleClose} className="p-1 hover:bg-surface-200 rounded-md transition-colors text-text-muted hover:text-text">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Results Area */}
          <div className="overflow-y-auto spatial-scrollbar py-2">
            
            {/* Empty State */}
            {allItems.length === 0 && (
              <div className="px-4 py-8 text-center text-text-muted text-sm">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {/* Navigation Commands */}
            {filteredNavCommands.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-widest">Navigation</div>
                {filteredNavCommands.map((item) => {
                  const index = allItems.indexOf(item);
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-surface-200 border-l-2 border-accent' : 'border-l-2 border-transparent hover:bg-surface-100'}`}
                      onClick={() => executeAction(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <item.icon size={16} className={isSelected ? 'text-text' : 'text-text-muted'} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-text' : 'text-text-secondary'}`}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Commands */}
            {filteredActionCommands.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-widest">Actions</div>
                {filteredActionCommands.map((item) => {
                  const index = allItems.indexOf(item);
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-surface-200 border-l-2 border-accent' : 'border-l-2 border-transparent hover:bg-surface-100'}`}
                      onClick={() => executeAction(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <item.icon size={16} className={isSelected ? (item.destructive ? 'text-rose' : 'text-text') : 'text-text-muted'} />
                      <span className={`text-sm font-medium ${isSelected ? (item.destructive ? 'text-rose' : 'text-text') : 'text-text-secondary'}`}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* User Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={12} /> Orbital Network
                </div>
                {searchResults.map((user) => {
                  // Find the user in allItems list by matching _id for selection state
                  const userItem = allItems.find(i => i.type === 'user' && i._id === user._id);
                  const index = allItems.indexOf(userItem);
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-surface-200 border-l-2 border-accent' : 'border-l-2 border-transparent hover:bg-surface-100'}`}
                      onClick={() => executeAction(userItem)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={user.profilePic} name={user.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className={`font-medium text-sm truncate ${isSelected ? 'text-text' : 'text-text-secondary'}`}>{user.fullName}</div>
                          <div className="text-xs text-text-muted truncate font-mono">@{user.username}</div>
                        </div>
                      </div>
                      <div>
                        {renderUserAction(user)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-surface/80 border-t border-default flex items-center gap-4 text-[10px] text-text-muted font-mono">
            <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-surface-200 border border-default">↑↓</span> to navigate</span>
            <span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-surface-200 border border-default">↵</span> to select</span>
          </div>

        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
