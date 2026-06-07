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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div 
        className="ads-surface-elevated w-full max-w-lg overflow-hidden relative shadow-elevation-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-default">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-ads-md bg-accent/10 flex items-center justify-center border border-accent/20">
              <Plus className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-text text-md">Establish Stream Room</h3>
              <p className="text-xxs text-text-muted">Spawn a new orbital center of momentum</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-surface-200 rounded-ads-sm transition-colors text-text-muted hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <label className="text-xs font-semibold text-text-secondary">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface text-text rounded-ads-md border border-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 text-sm outline-none transition-all duration-200"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-surface-100">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Core Topic / Gravity Focus</label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="e.g. React 19 compiling structures"
                value={formData.trendingTopic}
                onChange={(e) => setFormData({ ...formData, trendingTopic: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-text rounded-ads-md border border-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 text-sm outline-none transition-all duration-200"
                required
                maxLength={50}
              />
            </div>
            <p className="text-xxs text-text-muted">What is the active thread trending right now in this room?</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Description (Optional)</label>
            <textarea
              placeholder="Provide context on what this room accumulates score around..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 bg-surface text-text rounded-ads-md border border-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 text-sm outline-none transition-all duration-200 resize-none"
              maxLength={120}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="md"
            >
              Establish Orbit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
