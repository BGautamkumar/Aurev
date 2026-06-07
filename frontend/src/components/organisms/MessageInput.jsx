import { useState, useRef, useEffect, memo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Send, Paperclip, Smile, Mic, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { emojis } from '../../lib/utils';
import IconButton from '../atoms/IconButton';

const MessageInput = memo(() => {
  const {
    selectedUser, sendMessage, startTyping, stopTyping,
    isRecording: isRecordingFromStore, startRecording, stopRecording,
  } = useChatStore();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);
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

  return (
    <div className="px-4 py-3 bg-surface/60 backdrop-blur-xl border-t border-default rounded-b-2xl z-10">
      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-3 p-3 bg-surface-elevated rounded-xl flex items-center gap-3 border border-default animate-fade-in shadow-inner-light">
          <img src={attachment} alt="Attachment" className="w-14 h-14 object-cover rounded-md" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text">Image attached</p>
          </div>
          <IconButton variant="ghost" size="xs" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} aria-label="Remove attachment">
            <X size={14} />
          </IconButton>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <IconButton variant="ghost" onClick={() => fileInputRef.current?.click()} title="Attach file" aria-label="Attach image file">
          <Paperclip size={18} />
        </IconButton>

        {/* Emoji */}
        <div className="relative">
          <IconButton variant="ghost" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Add emoji" aria-label="Open emoji picker">
            <Smile size={18} />
          </IconButton>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 spatial-surface p-3 w-80 max-h-60 overflow-y-auto z-50 animate-scale-in">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-xl">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="flex-1 bg-surface border border-default rounded-xl focus-within:border-border-active focus-within:bg-surface-elevated transition-all duration-300 shadow-inner-light">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 bg-transparent resize-none text-base md:text-[15px] text-text placeholder:text-text-muted focus:outline-none"
            rows={1}
            style={{ maxHeight: '120px' }}
            aria-label="Type a message"
          />
        </div>

        {/* Send / Voice */}
        {text.trim() || attachment ? (
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ease-spatial active:scale-95 cursor-pointer ${
              isSending ? 'bg-primary/50 text-surface-base cursor-not-allowed' : 'bg-primary text-surface-base shadow-spatial-sm hover:bg-primary-hover hover:shadow-md'
            }`}
            aria-label="Send message"
          >
            {isSending ? (
              <div className="w-[18px] h-[18px] border-2 border-spatial-900/30 border-t-spatial-900 animate-spin rounded-full" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        ) : (
          <IconButton
            variant={isRecordingFromStore ? 'danger' : 'ghost'}
            onClick={toggleRecording}
            className={`active:scale-95 ${isRecordingFromStore ? 'animate-pulse' : ''}`}
            aria-label={isRecordingFromStore ? 'Stop recording' : 'Start recording'}
          >
            <Mic size={18} />
          </IconButton>
        )}
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';
export default MessageInput;
