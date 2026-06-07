import { useState } from 'react';
import { useStreamStore } from '../../store/useStreamStore';
import {
  Hash, Volume2, ArrowLeft, Mic, MicOff,
  PhoneOff, RefreshCw, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../atoms/Button';

const StreamRoomSidebar = () => {
  const {
    activeRoom,
    activeChannel,
    setActiveChannel,
    isVoiceConnected,
    connectedVoiceChannel,
    voiceLatency,
    connectVoice,
    disconnectVoice,
    leaveRoom
  } = useStreamStore();

  const [isMuted, setIsMuted] = useState(false);

  if (!activeRoom) return null;

  const handleChannelClick = (channel) => {
    if (channel.type === 'text') {
      setActiveChannel(channel);
    } else if (channel.type === 'voice') {
      connectVoice(channel.name);
    }
  };

  // Divide channels
  const textChannels = activeRoom.channels.filter((c) => c.type === 'text');
  const voiceChannels = activeRoom.channels.filter((c) => c.type === 'voice');

  return (
    <aside className="w-64 border-r border-default bg-surface-50/50 flex flex-col h-full select-none">
      
      {/* Header Info */}
      <div className="p-4 border-b border-default space-y-2">
        <div className="flex items-center justify-between">
          <Link
            to="/rooms"
            onClick={leaveRoom}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent font-semibold transition-colors"
          >
            <ArrowLeft size={13} /> Lobby
          </Link>
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
            {activeRoom.category.toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-text truncate tracking-tight">{activeRoom.name}</h3>
          <p className="text-[10px] text-text-secondary line-clamp-1">{activeRoom.description}</p>
        </div>
      </div>

      {/* Activity Heatmap Widget */}
      <div className="px-4 py-3 border-b border-default space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1">
            <Activity size={10} className="text-accent" /> Gravity Heatmap
          </span>
          <span className="text-[9px] font-mono text-text-muted">Live 24h</span>
        </div>
        {/* Heatmap Grid */}
        <div className="grid grid-cols-12 gap-0.5 p-1 bg-surface rounded-ads-sm border border-default">
          {activeRoom.heatmap.map((value, i) => {
            // Get color scale based on value (0 to 60)
            let color = 'bg-surface-200';
            if (value > 40) color = 'bg-accent shadow-glow-accent/10';
            else if (value > 25) color = 'bg-accent-hover';
            else if (value > 10) color = 'bg-accent/60';
            else if (value > 0) color = 'bg-accent/60';

            return (
              <div
                key={i}
                className={`h-2.5 rounded-sm transition-all duration-200 ${color}`}
                title={`Hour ${i + 1}: ${value} momentum spikes`}
              />
            );
          })}
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        
        {/* Text Channels */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2">
            Text Channels
          </span>
          {textChannels.map((channel) => {
            const isActive = activeChannel?.id === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-ads-md text-xs font-semibold tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/15'
                    : 'text-text-secondary hover:text-text hover:bg-surface-50 border border-transparent'
                }`}
              >
                <Hash className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                <span className="truncate">{channel.name}</span>
              </button>
            );
          })}
        </div>

        {/* Voice Channels */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 flex items-center justify-between">
            Voice Spaces
          </span>
          {voiceChannels.map((channel) => {
            const isVoiceActive = isVoiceConnected && connectedVoiceChannel === channel.name;
            return (
              <button
                key={channel.id}
                onClick={() => handleChannelClick(channel)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-ads-md text-xs font-semibold tracking-tight transition-all duration-200 ${
                  isVoiceActive
                    ? 'bg-emerald/10 text-emerald border border-emerald/15 shadow-glow-emerald/5'
                    : 'text-text-secondary hover:text-text hover:bg-surface-50 border border-transparent'
                }`}
              >
                <Volume2 className={`w-3.5 h-3.5 ${isVoiceActive ? 'text-emerald animate-pulse' : 'text-text-muted'}`} />
                <span className="truncate">{channel.name}</span>
                {isVoiceActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Connection Status Tray */}
      {isVoiceConnected && (
        <div className="p-3 bg-surface-100/90 border-t border-default space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-emerald leading-tight">Connected Voice</p>
                <p className="text-[9px] text-text-secondary truncate leading-tight mt-0.5">{connectedVoiceChannel}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 font-mono text-[9px] text-text-muted">
              <RefreshCw size={8} className="animate-spin text-emerald/60" />
              <span>{voiceLatency}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsMuted(!isMuted)}
              className="flex-1 py-1.5 rounded-ads-sm"
            >
              {isMuted ? (
                <span className="flex items-center justify-center gap-1.5 text-rose"><MicOff size={11} /> Muted</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5 text-text-secondary"><Mic size={11} /> Unmuted</span>
              )}
            </Button>
            
            <button
              onClick={disconnectVoice}
              className="p-1.5 rounded-ads-sm bg-rose/10 hover:bg-rose/20 text-rose border border-rose/15 transition-all duration-200"
              title="Disconnect voice stream"
            >
              <PhoneOff size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default StreamRoomSidebar;
