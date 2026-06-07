import { useStreamStore } from '../../store/useStreamStore';
import { Hash, Users, Radio } from 'lucide-react';

const RoomHeader = () => {
  const { activeRoom, activeChannel } = useStreamStore();

  if (!activeRoom || !activeChannel) return null;

  return (
    <header className="h-14 border-b border-default bg-surface-50/20 flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-ads-sm bg-surface border border-default text-accent">
          <Hash className="w-4 h-4" />
        </div>
        
        <div className="min-w-0 flex items-baseline gap-2.5">
          <h2 className="font-extrabold text-sm text-text truncate tracking-tight">
            {activeChannel.name}
          </h2>
          {activeChannel.topic && (
            <>
              <div className="w-px h-3 bg-border hidden sm:block" />
              <p className="text-[11px] text-text-secondary truncate hidden sm:block leading-normal">
                {activeChannel.topic}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Members Count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface rounded-ads-sm border border-default text-xxs font-mono text-text-secondary">
          <Users size={11} className="text-text-muted" />
          <span>{activeRoom.activeCount} active</span>
        </div>

        {/* Room Echo Score Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 rounded-ads-sm border border-accent/25 text-xxs font-mono text-accent shadow-glow-accent/5">
          <Radio size={11} className="animate-pulse" />
          <span>{activeRoom.echoScore.toLocaleString()} AU</span>
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;
