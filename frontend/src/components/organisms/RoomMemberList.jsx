import { useStreamStore } from '../../store/useStreamStore';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../atoms/Avatar';
import { Crown, Sparkles, Shield, User } from 'lucide-react';

const tierDetails = {
  legend: { label: 'Legend', color: 'text-accent', icon: Crown, border: 'ring-2 ring-accent shadow-glow-accent/10' },
  diamond: { label: 'Diamond', color: 'text-cyan', icon: Sparkles, border: 'ring-2 ring-cyan shadow-glow-cyan/10' },
  platinum: { label: 'Platinum', color: 'text-indigo-400', icon: Shield, border: 'ring-2 ring-indigo-400/50' },
  gold: { label: 'Gold', color: 'text-accent-hover', icon: User, border: 'ring-1 ring-accent-hover/40' },
  silver: { label: 'Silver', color: 'text-text-secondary', icon: User, border: 'ring-1 ring-border' },
  bronze: { label: 'Bronze', color: 'text-orange-600', icon: User, border: 'ring-1 ring-orange-600/20' },
};

const RoomMemberList = () => {
  const { activeRoom } = useStreamStore();
  const { authUser } = useAuthStore();

  if (!activeRoom) return null;

  const dbMembers = activeRoom.members || [];
  
  // Format real members
  const allMembers = dbMembers.map((m) => {
    const isMe = m._id === authUser?._id;
    return {
      id: m._id,
      fullName: isMe ? `${m.fullName} (You)` : m.fullName,
      username: m.email ? m.email.split("@")[0] : (m.username || "orbiter"),
      tier: m.aurevTier || m.tier || "bronze",
      status: isMe ? "online" : "offline", // Socket integrations could update this, default to offline for others for now
    };
  });

  // Group members by tier
  const groups = allMembers.reduce((acc, member) => {
    const tier = member.tier || 'bronze';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(member);
    return acc;
  }, {});

  // Sort tiers by hierarchy
  const sortedTiers = ['legend', 'diamond', 'platinum', 'gold', 'silver', 'bronze'].filter(t => groups[t]);

  return (
    <aside className="w-56 border-l border-default bg-surface-50/30 flex flex-col h-full select-none overflow-y-auto shrink-0 hidden md:block">
      <div className="p-4 border-b border-default">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Orbiting Users — {allMembers.length}
        </h3>
      </div>

      <div className="p-2 space-y-4">
        {sortedTiers.map((tier) => {
          const details = tierDetails[tier] || tierDetails.bronze;
          const TierIcon = details.icon;
          const members = groups[tier];

          return (
            <div key={tier} className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <TierIcon size={10} className={details.color} />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${details.color}`}>
                  {details.label} — {members.length}
                </span>
              </div>

              <div className="space-y-0.5">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 p-1.5 rounded-ads-md hover:bg-surface-50 transition-colors cursor-pointer group"
                  >
                    <div className={`rounded-full shrink-0 ${details.border}`}>
                      <Avatar
                        name={member.fullName}
                        size="xs"
                        online={member.status === 'online'}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors leading-tight">
                        {member.fullName}
                      </p>
                      <p className="text-[9px] text-text-muted truncate font-mono leading-tight">
                        @{member.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default RoomMemberList;
