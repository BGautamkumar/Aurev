import { useState, useEffect } from 'react';
import { useStreamStore } from '../../store/useStreamStore';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { X, Plus, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateRoomModal = ({ isOpen, onClose }) => {
  const { createRoom } = useStreamStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'tech',
    description: '',
    trendingTopic: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        category: 'tech',
        description: '',
        trendingTopic: ''
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error('Room name is required');
    }
    if (!formData.trendingTopic.trim()) {
      return toast.error('Trending topic is required to build gravity');
    }

    const newRoom = createRoom(formData);
    toast.success(`Gravity field established for "${newRoom.name}"!`);
    onClose();
  };

  const categories = [
    { value: 'tech', label: 'Technology & Dev' },
    { value: 'gaming', label: 'Gaming & Esport' },
    { value: 'music', label: 'Music & Ambience' },
    { value: 'art', label: 'Art & Creative Coding' },
    { value: 'crypto', label: 'Web3 & EVM Builders' },
    { value: 'science', label: 'Science & Cosmos' }
  ];

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 140ms',
    fontFamily: 'Inter, sans-serif',
  };

  const inputFocusHandler = (e) => {
    e.currentTarget.style.borderColor = 'var(--border-mid)';
    e.currentTarget.style.boxShadow = 'inset 3px 0 0 var(--accent-base), 0 0 0 2px var(--accent-subtle)';
  };
  const inputBlurHandler = (e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(5, 5, 5, 0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden relative animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Noise */}
        <div className="absolute inset-0 charged-noise pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-subtle)' }}
            >
              <Plus className="w-4 h-4" style={{ color: 'var(--accent-base)' }} />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Establish Stream Room</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Spawn a new orbital center of momentum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-4">
          <Input
            type="text"
            label="Room Name"
            placeholder="e.g. Next.js Core Stack"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            maxLength={32}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={inputStyle}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} style={{ background: 'var(--elevated)' }}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Core Topic / Gravity Focus</label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. React 19 compiling structures"
                value={formData.trendingTopic}
                onChange={(e) => setFormData({ ...formData, trendingTopic: e.target.value })}
                style={{ ...inputStyle, paddingLeft: 40 }}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
                maxLength={50}
              />
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>What is the active thread trending right now in this room?</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Description (Optional)</label>
            <textarea
              placeholder="Provide context on what this room accumulates score around..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
              maxLength={120}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="md">
              Establish Orbit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
