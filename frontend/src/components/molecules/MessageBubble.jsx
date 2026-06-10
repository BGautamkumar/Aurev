import { memo, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatMessageTime } from '../../lib/utils';
import { useChatStore } from '../../store/useChatStore';
import Avatar from '../atoms/Avatar';
import { Check, CheckCheck, Pencil, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageBubble = memo(({ message, isConsecutive }) => {
  const { authUser } = useAuthStore();
  const { markMessageAsSeen, editMessage, deleteMessage } = useChatStore();

  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');

  const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
  const senderName = typeof message.senderId === 'object' ? message.senderId.fullName : 'Unknown';
  const senderProfilePic = typeof message.senderId === 'object' ? message.senderId.profilePic : null;
  const isOwn = senderId === authUser._id;

  const isEmojiOnly = message.text &&
    /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(message.text.trim());

  const handleMessageClick = () => {
    if (message.image) window.open(message.image, '_blank');
    if (!isOwn && message.status !== 'seen') markMessageAsSeen(message._id);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) editMessage(message._id, editText.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message?')) deleteMessage(message._id);
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case 'seen':
        return <CheckCheck size={14} style={{ color: 'var(--success)' }} />;
      case 'delivered':
        return <CheckCheck size={14} style={{ color: 'var(--text-muted)' }} />;
      case 'pending':
        return <div className="w-3 h-3 border-2 animate-spin rounded-full" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} title="Sending..." />;
      case 'failed':
        return <AlertCircle size={14} style={{ color: 'var(--danger)' }} className="cursor-pointer" title="Failed to send" />;
      default:
        return <Check size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const isRecent = Date.now() - new Date(message.createdAt).getTime() < 10000;

  return (
    <motion.div
      initial={isRecent ? { opacity: 0, y: 10, scale: 0.98 } : false}
      animate={isRecent ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-0.5' : 'mt-4'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isConsecutive ? (
        <div className="flex-shrink-0 mb-1">
          <Avatar
            src={isOwn ? authUser?.profilePic : senderProfilePic}
            name={isOwn ? authUser?.fullName : senderName}
            size="xs"
            showOnlineIndicator={false}
          />
        </div>
      ) : (
        <div className="w-6" />
      )}

      <div className={`max-w-[75%] lg:max-w-md xl:max-w-lg flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {!isOwn && !isConsecutive && (
          <div className="text-xs mb-1 px-1 font-medium" style={{ color: 'var(--text-muted)' }}>{senderName}</div>
        )}

        {/* Bubble */}
        <div
          className={`relative group transition-all duration-normal ${message.status === 'pending' ? 'opacity-70' : ''}`}
          style={
            isEmojiOnly
              ? { fontSize: '1.875rem', lineHeight: 1.2, padding: '4px 0' }
              : isOwn
                ? {
                    background: '#2563EB',
                    borderRadius: '18px 18px 4px 18px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  }
                : {
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '10px 14px',
                    color: 'var(--text-200)',
                  }
          }
          onClick={handleMessageClick}
        >
          {/* Image */}
          {message.image && (
            <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
              <img
                src={message.image}
                alt="Shared image"
                className="max-w-full rounded-xl hover:opacity-90 transition-opacity"
                style={{ border: '1px solid var(--border)' }}
                loading="lazy"
              />
            </div>
          )}

          {/* Text */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="px-2 py-1 text-sm flex-1 min-w-[120px] rounded-md outline-none"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setIsEditing(false); }}
              />
              <button onClick={handleSaveEdit} style={{ color: 'var(--success)' }}><Save size={14} /></button>
              <button onClick={() => setIsEditing(false)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
          ) : message.text && !isEmojiOnly ? (
            <p className="text-[15px] leading-relaxed break-words">
              {message.text}
              {message.editedAt && <span className="text-[10px] opacity-50 ml-1.5 font-medium">(edited)</span>}
            </p>
          ) : message.text ? (
            <span>{message.text}</span>
          ) : null}

          {/* Actions on hover (own messages only) */}
          {showActions && isOwn && !isEditing && (
            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-fast ${isOwn ? '-left-14' : '-right-14'}`}>
              <button
                onClick={() => { setIsEditing(true); setEditText(message.text || ''); }}
                className="p-1 rounded-md"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                title="Edit"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded-md"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp + Status */}
        <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`} style={{ color: 'var(--text-muted)' }}>
          <span className="font-medium">{formatMessageTime(message.createdAt)}</span>
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;
