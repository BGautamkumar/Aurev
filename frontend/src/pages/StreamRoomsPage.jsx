import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamStore } from '../store/useStreamStore';
import CreateRoomModal from '../components/organisms/CreateRoomModal';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Avatar from '../components/atoms/Avatar';
import {
  Radio, Compass, Code, Gamepad2, Music, Palette,
  Coins, Atom, Users, Zap, Plus, ArrowRight, Search, Activity
} from 'lucide-react';

const categoryIcons = {
  all: Compass,
  tech: Code,
  gaming: Gamepad2,
  music: Music,
  art: Palette,
  crypto: Coins,
  science: Atom,
};

const categoryLabels = {
  all: 'All Frequencies',
  tech: 'Technology',
  gaming: 'Gaming',
  music: 'Music',
  art: 'Art & Design',
  crypto: 'Web3 & EVM',
  science: 'Science',
};

const WaveformAnimation = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <svg viewBox="0 0 800 200" className="w-full h-full">
      <path
        d="M 0,100 C 150,150 200,50 350,100 C 500,150 550,50 700,100 L 800,100"
        fill="none"
        stroke="var(--ads-gold)"
        strokeWidth="2.5"
        className="opacity-70 animate-glow-breathe"
      />
      <path
        d="M 0,100 C 100,50 250,150 400,100 C 550,50 650,150 800,100"
        fill="none"
        stroke="var(--ads-cyan)"
        strokeWidth="1.5"
        className="opacity-40 animate-pulse"
      />
      <path
        d="M 0,100 C 200,180 300,20 500,100 C 700,180 750,20 800,100"
        fill="none"
        stroke="var(--ads-gold)"
        strokeWidth="1"
        className="opacity-30"
      />
    </svg>
  </div>
);

const StreamRoomsPage = () => {
  const navigate = useNavigate();
  const { rooms, joinRoom, fetchRooms, isLoadingRooms } = useStreamStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleEnterRoom = (roomId) => {
    joinRoom(roomId);
    navigate(`/rooms/${roomId}`);
  };

  // Filtered rooms list
  const filteredRooms = rooms.filter((room) => {
    const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
    const matchesSearch = (room.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.trendingTopic?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredRooms = rooms.filter(r => r.health === 'hot').slice(0, 2);

  return (
    <div className="h-full bg-surface flex flex-col overflow-y-auto">
      <CreateRoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Hero Banner Section */}
      <section className="relative w-full py-16 border-b border-default bg-gradient-to-b from-surface-100/30 to-transparent overflow-hidden">
        <WaveformAnimation />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <Badge variant="accent" className="px-3 py-1 font-mono tracking-widest text-xxs uppercase">
              Momentum Spaces
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
              Find your <span className="ads-text-gradient">frequency</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              Orbit communities where gravity is earned in real time. Contribute, build momentum, and secure Aurev Score.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search frequencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-100 text-text rounded-ads-md border border-default focus:border-accent/40 focus:ring-4 focus:ring-accent/5 text-sm outline-none transition-all duration-200"
              />
            </div>
            <Button
              variant="accent"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={16} />}
              className="w-full sm:w-auto shrink-0 shadow-glow-accent hover:shadow-glow-accent-lg"
            >
              Establish Room
            </Button>
          </div>
        </div>
      </section>

      {/* Main Discover Layout */}
      <div className="max-w-[1400px] mx-auto px-6 py-10 w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filter */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted">Categories</h2>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-3 lg:pb-0 scrollbar-none">
              {Object.keys(categoryIcons).map((cat) => {
                const Icon = categoryIcons[cat];
                const count = cat === 'all' 
                  ? rooms.length 
                  : rooms.filter(r => r.category === cat).length;
                
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-ads-md text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? 'bg-accent/10 text-accent border border-accent/20 shadow-glow-accent/5'
                        : 'text-text-secondary hover:text-text hover:bg-surface-50 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-muted group-hover:text-text'}`} />
                    <span className="flex-1 text-left">{categoryLabels[cat]}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-accent/20 text-accent' : 'bg-surface-100 text-text-muted'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-3">
          {isLoadingRooms ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="relative rounded-[24px] border border-default bg-surface-100/30 p-12 text-center overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
              {/* Atmospheric background glow */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9zdmc+')] mix-blend-overlay" />
              <div className="absolute w-[250px] h-[250px] bg-accent/5 rounded-full filter blur-[60px] animate-pulse" />
              
              <div className="relative z-10 space-y-5 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto shadow-glow-accent/5 relative">
                  <Radio className="w-6 h-6 text-accent/50 animate-glow-breathe" />
                  <span className="absolute inset-0 rounded-full border border-accent/20 animate-ping opacity-10" />
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono tracking-widest text-accent uppercase bg-accent/10 px-2 py-0.5 rounded border border-accent/20 mx-auto w-fit block">
                    No active rooms yet
                  </span>
                  <h3 className="text-xl font-bold text-text">
                    Create the first frequency
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Communities appear when real people connect. Join the orbit, shape the digital space, and start the first transmission.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured Section */}
              {selectedCategory === 'all' && !searchQuery && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent animate-pulse" /> High Gravity
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {featuredRooms.map((room) => (
                      <div
                        key={room._id || room.id}
                        className="group relative rounded-ads-lg border border-accent/30 bg-surface-100/80 p-6 flex flex-col justify-between min-h-[190px] shadow-elevation-2 hover:border-accent transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                        onClick={() => handleEnterRoom(room._id || room.id)}
                      >
                        <div className="absolute -inset-px bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-semibold tracking-wider text-accent uppercase flex items-center gap-1.5">
                              <Activity className="w-3 h-3 animate-pulse" /> {room.category?.toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] font-mono text-text-secondary">
                              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse-online" />
                              <span>{room.members?.length || 0} active</span>
                            </div>
                          </div>
                          <h4 className="text-md font-bold text-text group-hover:text-accent transition-colors">
                            {room.name}
                          </h4>
                          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {room.description}
                          </p>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-default mt-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-[11px] font-mono text-text-secondary">{room.members?.length || 0} orbiters</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-accent font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">
                            <span>Enter Room</span>
                            <ArrowRight size={13} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  {searchQuery ? `Search Results (${filteredRooms.length})` : 'Active Stations'}
                </h3>
                
                {filteredRooms.length > 0 ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredRooms.map((room) => {
                      const CatIcon = categoryIcons[room.category] || Code;
                      const isHot = room.health === 'hot';
                      const isWarm = room.health === 'warm';

                      return (
                        <div
                          key={room._id || room.id}
                          className="group rounded-ads-md border border-default bg-surface-50/50 hover:bg-surface-50 p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-border-lit hover:-translate-y-0.5 cursor-pointer relative"
                          onClick={() => handleEnterRoom(room._id || room.id)}
                        >
                          {/* Top section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="w-7 h-7 rounded-ads-sm bg-surface-100 flex items-center justify-center border border-default text-text-secondary group-hover:text-accent transition-colors">
                                <CatIcon className="w-3.5 h-3.5" />
                              </div>
                              
                              {/* Pulse indicator */}
                              <div className="flex items-center gap-1.5">
                                <div className="relative flex h-2 w-2">
                                  {isHot && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                                  )}
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                    isHot ? 'bg-emerald' : isWarm ? 'bg-accent' : 'bg-text-muted'
                                  }`} />
                                </div>
                                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{room.health}</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
                                {room.name}
                              </h4>
                              <p className="text-xxs text-text-muted font-mono truncate mt-0.5">
                                Trending: #{room.trendingTopic}
                              </p>
                            </div>

                            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                              {room.description}
                            </p>
                          </div>

                          {/* Bottom stats / avatars */}
                          <div className="pt-4 flex items-center justify-between border-t border-default mt-4">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {room.members?.slice(0, 3).map((member) => (
                                <div key={member._id || member.id} className="relative inline-block ring-2 ring-surface rounded-full">
                                  <Avatar
                                    name={member.fullName}
                                    size="xs"
                                    online={false}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                                {(room.aurevScore || 0).toLocaleString()} AU
                              </span>
                            </div>
                          </div>

                          {/* Hover action block overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-surface-100/90 rounded-ads-md opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-xs">
                            <Button
                              variant="accent"
                              size="sm"
                              iconRight={<ArrowRight size={13} />}
                            >
                              Enter Room
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-surface-50/20 rounded-ads-lg border border-dashed border-default">
                    <Radio className="w-10 h-10 text-text-disabled mx-auto mb-3 animate-pulse" />
                    <h4 className="font-bold text-text mb-1">No channels on this frequency</h4>
                    <p className="text-xs text-text-muted max-w-xs mx-auto">
                      Expand your filter options or create a custom orbital room to start building score.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StreamRoomsPage;
