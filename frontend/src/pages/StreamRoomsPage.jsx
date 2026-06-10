import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStreamStore } from '../store/useStreamStore';
import { useAuthStore } from '../store/useAuthStore';
import Avatar from '../components/atoms/Avatar';
import {
  Radio, Plus, Users, Search, Hash, Headphones,
  Gamepad2, Code, Palette, Music, BookOpen, Rocket,
  Globe, Heart, Zap, ArrowRight, Wifi
} from 'lucide-react';
import CreateRoomModal from '../components/organisms/CreateRoomModal';

const categoryIcons = {
  general: Globe, technology: Code, gaming: Gamepad2,
  music: Music, art: Palette, education: BookOpen,
  science: Rocket, health: Heart, social: Headphones,
  other: Hash,
};

const StreamRoomsPage = () => {
  const { rooms, isLoading, fetchRooms } = useStreamStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(rooms.map(r => r.category || 'general'))];
    return cats;
  }, [rooms]);

  const filteredRooms = useMemo(() =>
    rooms.filter(room => {
      const matchesSearch = !searchQuery || room.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || (room.category || 'general') === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
  [rooms, searchQuery, selectedCategory]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--base)' }}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Animated noise background */}
        <div className="absolute inset-0 charged-noise" style={{ opacity: 0.03 }} />
        {/* Animated waveform lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full h-16 opacity-[0.06]" viewBox="0 0 800 64" preserveAspectRatio="none">
            <path d="M0,32 C100,10 200,54 300,32 C400,10 500,54 600,32 C700,10 800,54 800,32" fill="none" stroke="var(--accent-base)" strokeWidth="1.5">
              <animate attributeName="d" dur="4s" repeatCount="indefinite" values="
                M0,32 C100,10 200,54 300,32 C400,10 500,54 600,32 C700,10 800,54 800,32;
                M0,32 C100,50 200,14 300,32 C400,50 500,14 600,32 C700,50 800,14 800,32;
                M0,32 C100,10 200,54 300,32 C400,10 500,54 600,32 C700,10 800,54 800,32
              " />
            </path>
          </svg>
        </div>

        <div className="relative z-10 px-6 pt-8 pb-6 space-y-4">
          <div>
            <div className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent-base)' }}>
              Momentum Spaces
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Find your frequency
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-fast"
                style={{ color: searchFocused ? 'var(--text-primary)' : 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search rooms..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-fast"
                style={{
                  background: 'var(--elevated)',
                  border: searchFocused ? '1px solid var(--border-lit)' : '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  boxShadow: searchFocused ? 'inset 3px 0 0 var(--accent-base)' : 'none',
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            {/* Create Room */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-fast active:scale-[0.96]"
              style={{
                background: 'var(--accent-base)',
                color: 'var(--void)',
                boxShadow: '0 4px 16px var(--accent-subtle)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-base)'; e.currentTarget.style.boxShadow = '0 6px 24px var(--accent-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-base)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-subtle)'; }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Create Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Categories sidebar */}
        <div className="hidden lg:flex flex-col w-[220px] py-4 px-3 flex-shrink-0 overflow-y-auto charged-scrollbar" style={{ borderRight: '1px solid var(--border)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3" style={{ color: 'var(--text-muted)' }}>Categories</div>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Hash;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-fast mb-0.5 text-left"
                style={{
                  background: active ? 'var(--accent-subtle)' : 'transparent',
                  borderLeft: active ? '3px solid var(--accent-base)' : '3px solid transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--elevated)'; e.currentTarget.style.borderLeftColor = 'var(--border-mid)'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; } }}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                <span className="capitalize">{cat === 'all' ? 'All Rooms' : cat}</span>
                {cat !== 'all' && (
                  <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {rooms.filter(r => (r.category || 'general') === cat).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile category pills */}
        <div className="lg:hidden flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0 charged-scrollbar" style={{ borderBottom: '1px solid var(--border)' }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: active ? 'var(--accent-subtle)' : 'var(--surface)',
                  border: active ? '1px solid var(--border-mid)' : '1px solid var(--border)',
                  color: active ? 'var(--accent-base)' : 'var(--text-secondary)',
                }}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            );
          })}
        </div>

        {/* Room grid */}
        <div className="flex-1 overflow-y-auto charged-scrollbar p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center space-y-6">
                {/* Animated concentric rings */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-strong)' }} />
                  <div className="absolute w-full h-full rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-subtle)', animationDelay: '0.7s' }} />
                  <div className="absolute w-full h-full rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-subtle)', animationDelay: '1.4s' }} />
                  <Radio className="w-10 h-10 relative z-10" strokeWidth={1.5} style={{ color: 'var(--border-mid)' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No frequencies found</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create the first frequency</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.96]"
                  style={{ background: 'var(--accent-base)', color: 'var(--void)', boxShadow: '0 4px 16px var(--accent-subtle)' }}
                >
                  <Plus size={16} /> Create Room
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredRooms.map((room) => {
                const Icon = categoryIcons[room.category] || Hash;
                const isLive = room.participants?.length > 0;
                const isCreator = room.createdBy?._id === authUser?._id || room.createdBy === authUser?._id;
                const participantCount = room.participants?.length || 0;
                const maxShown = 4;

                return (
                  <motion.div
                    key={room._id}
                    variants={cardVariants}
                    className="group relative overflow-hidden transition-all duration-normal cursor-pointer"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                    onClick={() => navigate(`/rooms/${room._id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-lit)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    }}
                  >
                    {/* Noise texture */}
                    <div className="absolute inset-0 charged-noise" />

                    {/* Cyan ambient on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-normal pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 100%, var(--accent-subtle), transparent 70%)' }} />

                    <div className="relative z-10 p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-subtle)' }}
                          >
                            <Icon size={18} style={{ color: 'var(--accent-base)' }} />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>{room.category || 'general'}</span>
                              {isCreator && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-base)' }}>
                                  Owner
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: isLive ? 'var(--online)' : 'var(--text-muted)',
                              boxShadow: isLive ? '0 0 6px var(--online)' : 'none',
                              animation: isLive ? 'pulse-ring 2s ease-in-out infinite' : 'none',
                            }}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isLive ? 'var(--online)' : 'var(--text-muted)' }}>
                            {isLive ? 'Live' : 'Quiet'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {room.description && (
                        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{room.description}</p>
                      )}

                      {/* Bottom row */}
                      <div className="flex items-center justify-between">
                        {/* Members */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {(room.participants || []).slice(0, maxShown).map((p, i) => (
                              <Avatar key={p._id || i} src={p.profilePic} name={p.fullName} size="xs" showOnlineIndicator={false} className="ring-1 ring-base" />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                            <Users size={12} className="inline mr-1" />
                            {participantCount}
                          </span>
                        </div>

                        {/* Enter button — visible on hover */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-fast translate-y-2 group-hover:translate-y-0" style={{ color: 'var(--accent-base)' }}>
                          Enter <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default StreamRoomsPage;
