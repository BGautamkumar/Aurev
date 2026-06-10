import { useState, useRef, useEffect, memo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Send, Paperclip, Smile, Mic, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { emojis } from '../../lib/utils';

const MessageInput = memo(() => {
  const {
    selectedUser, sendMessage, startTyping, stopTyping,
    isRecording: isRecordingFromStore, startRecording, stopRecording,
  } = useChatStore();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleTyping = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (newText.trim()) {
      startTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(), 1000);
    } else {
      stopTyping();
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !attachment) return;
    setIsSending(true);
    try {
      await sendMessage({ text: text.trim(), image: attachment });
      setText('');
      setAttachment(null);
      stopTyping();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setAttachment(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (isRecordingFromStore) stopRecording();
    else startRecording();
  };

  if (!selectedUser) return null;

  const hasContent = text.trim() || attachment;

  return (
    <div
      className="px-5 py-3 z-10 flex-shrink-0"
      style={{
        background: 'var(--glass-background)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Attachment Preview */}
      {attachment && (
        <div
          className="mb-3 p-3 rounded-xl flex items-center gap-3 animate-fade-in"
          style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
        >
          <img src={attachment} alt="Attachment" className="w-14 h-14 object-cover rounded-md" />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Image attached</p>
          </div>
          <button
            onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
          aria-label="Attach image file"
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-fast"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Paperclip size={18} />
        </button>

        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
            aria-label="Open emoji picker"
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-fast"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Smile size={18} />
          </button>
          {showEmojiPicker && (
            <div
              className="absolute bottom-12 left-0 charged-glass p-3 w-80 max-h-60 overflow-y-auto z-50 animate-scale-in charged-scrollbar"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 rounded-lg transition-colors text-xl"
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text input */}
        <div
          className="flex-1 rounded-2xl transition-all duration-fast"
          style={{
            background: 'var(--surface)',
            border: inputFocused ? '1px solid var(--accent-hover)' : '1px solid var(--border-subtle)',
            boxShadow: inputFocused ? '0 0 0 3px var(--accent-subtle)' : 'none',
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 bg-transparent resize-none text-[15px] focus:outline-none"
            style={{
              color: 'var(--text-primary)',
              maxHeight: '120px',
            }}
            rows={1}
            aria-label="Type a message"
          />
        </div>

        {/* Send / Voice */}
        {hasContent ? (
          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-fast active:scale-[0.92]"
            style={{
              background: isSending ? 'var(--accent-base)' : 'var(--accent-base)',
              color: 'var(--white-pure)',
              cursor: isSending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px var(--accent-subtle)',
            }}
            onMouseEnter={(e) => { if (!isSending) e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            aria-label="Send message"
          >
            {isSending ? (
              <div className="w-[18px] h-[18px] border-2 animate-spin rounded-full" style={{ borderColor: 'var(--accent-subtle)', borderTopColor: 'var(--white-pure)' }} />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        ) : (
          <button
            onClick={toggleRecording}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-fast active:scale-[0.92] ${isRecordingFromStore ? 'animate-pulse' : ''}`}
            style={{
              background: isRecordingFromStore ? 'var(--danger)' : 'transparent',
              color: isRecordingFromStore ? 'var(--white-pure)' : 'var(--text-muted)',
            }}
            onMouseEnter={(e) => { if (!isRecordingFromStore) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--elevated)'; } }}
            onMouseLeave={(e) => { if (!isRecordingFromStore) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
            aria-label={isRecordingFromStore ? 'Stop recording' : 'Start recording'}
          >
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';
export default MessageInput;
