import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAurevStore } from '../store/useAurevStore';
import {
  ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus,
  Users, Globe, Crown, Zap, Shield, Lock
} from 'lucide-react';
import Avatar from '../components/atoms/Avatar';
import Badge from '../components/atoms/Badge';

const tierConfig = {
  bronze:  { label: 'Bronze',  color: 'text-amber-700',   bg: 'bg-amber-700/10',   border: 'border-amber-700/20',   gradient: 'from-amber-700 to-amber-900', icon: Shield },
  silver:  { label: 'Silver',  color: 'text-gray-400',    bg: 'bg-gray-400/10',     border: 'border-gray-400/20',    gradient: 'from-gray-400 to-gray-600', icon: Shield },
  gold:    { label: 'Gold',    color: 'text-accent',    bg: 'bg-accent/10',     border: 'border-accent/20',    gradient: 'from-accent to-accent', icon: Crown },
  diamond: { label: 'Diamond', color: 'text-cyan',        bg: 'bg-cyan/10',         border: 'border-cyan/20',        gradient: 'from-cyan to-blue-600', icon: Zap },
  legend:  { label: 'Legend',  color: 'text-accent',    bg: 'bg-accent/10',     border: 'border-accent/20',    gradient: 'from-accent to-accent-hover', icon: Trophy },
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp size={14} className="text-emerald" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-rose" />;
  return <Minus size={14} className="text-text-muted" />;
};

const AurevRankPage = () => {
  const navigate = useNavigate();
  const { authUser, socket } = useAuthStore();
  const {
    aurevScore,
    aurevTier,
    aurevRank,
    leaderboard,
    isLoadingLeaderboard,
    getAurevScore,
    getLeaderboard,
    subscribeToAurevUpdates,
    unsubscribeFromAurevUpdates
  } = useAurevStore();

  const [filter, setFilter] = useState('global');
  const [timeRange] = useState('all');

  useEffect(() => {
    getAurevScore();
  }, [getAurevScore]);

  useEffect(() => {
    getLeaderboard(filter, timeRange);
  }, [getLeaderboard, filter, timeRange]);

  useEffect(() => {
    if (socket) {
      subscribeToAurevUpdates(socket);
      return () => unsubscribeFromAurevUpdates(socket);
    }
  }, [socket, subscribeToAurevUpdates, unsubscribeFromAurevUpdates]);

  const myScore = aurevScore || 0;
  const myTier = aurevTier || 'bronze';
  const myRank = aurevRank || '-';
  const myTierConfig = tierConfig[myTier] || tierConfig.bronze;

  // Next tier threshold calculation
  const getNextTierThreshold = (tier) => {
    switch (tier) {
      case 'bronze': return { label: 'Silver', score: 100 };
      case 'silver': return { label: 'Gold', score: 500 };
      case 'gold': return { label: 'Diamond', score: 2000 };
      case 'diamond': return { label: 'Legend', score: 5000 };
      default: return { label: 'Max Level', score: 5000 };
    }
  };

  const nextTier = getNextTierThreshold(myTier);
  const percentToNext = nextTier.score > myScore ? (myScore / nextTier.score) * 100 : 100;

  const filters = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'friends', label: 'Friends', icon: Users },
  ];

  const timeRanges = [
    { id: 'all', label: 'All Time' },
  ];

  // Dynamic Milestones based on caller's real parameters
  const journeyMilestones = [
    { id: 'm1', label: 'First Spike Spoken', desc: 'Secure connection established, broadcasted first message', date: myScore > 0 ? 'Active' : 'Locked', unlocked: myScore > 0 },
    { id: 'm2', label: 'Reached Silver Status', desc: 'Crossed 100 Aurev Score parameters', date: myScore >= 100 ? 'Active' : 'Locked', unlocked: myScore >= 100 },
    { id: 'm3', label: 'Reached Gold Status', desc: 'Crossed 500 Aurev Score parameters', date: myScore >= 500 ? 'Active' : 'Locked', unlocked: myScore >= 500 },
  ];

  // Podium splits
  const top1 = leaderboard.find(u => u.rank === 1);
  const top2 = leaderboard.find(u => u.rank === 2);
  const top3 = leaderboard.find(u => u.rank === 3);

  const listUsers = leaderboard.filter(u => u.rank > 3);

  return (
    <div className="h-full pt-8 pb-12 px-6 bg-surface overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Link */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6 text-sm">
          <ArrowLeft size={18} /> Back to Chat
        </button>

        {/* Personal Score Card */}
        <div className="ads-surface overflow-hidden">
          <div className="relative p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-cyan/3" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar src={authUser?.profilePic} name={authUser?.fullName} size="xl" aurevTier={myTier} showOnlineIndicator={false} />
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${myTierConfig.gradient} flex items-center justify-center border-2 border-surface-50`}>
                  <myTierConfig.icon size={14} className="text-white" />
                </div>
              </div>
              <div className="flex-grow text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 mb-2">
                  <h2 className="text-xl font-bold text-text">{authUser?.fullName}</h2>
                  <Badge variant="accent" size="md">{myTierConfig.label}</Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-5">
                  <div>
                    <span className="text-3xl font-black ads-text-gradient">{myScore}</span>
                    <span className="text-text-muted text-[11px] font-mono ml-2 uppercase">Aurev Score</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <span className="text-2xl font-bold text-text">#{myRank}</span>
                    <span className="text-text-muted text-[11px] font-mono ml-2 uppercase">Global Rank</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress to next tier */}
            {myTier !== 'legend' && (
              <div className="mt-8 relative">
                <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-mono">
                  <span>{myTierConfig.label}</span>
                  <span>{nextTier.label} — {nextTier.score} pts</span>
                </div>
                <div className="h-2 bg-surface-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-accent rounded-full transition-all duration-500" style={{ width: `${percentToNext}%` }} />
                </div>
                <div className="text-xs text-text-muted mt-1 font-mono">{nextTier.score - myScore} pts to next tier</div>
              </div>
            )}
          </div>
        </div>

        {/* Podium Controls Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-default">
          <h2 className="text-md font-bold text-text flex items-center gap-2">
            <Trophy size={18} className="text-accent" /> Orbital Leaderboard
          </h2>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="flex gap-1 bg-surface-100 rounded-ads-md p-1 border border-default flex-1 sm:flex-none">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-ads-sm text-xs font-semibold transition-all duration-200 ${
                    filter === f.id ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <f.icon size={12} /> {f.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-1 bg-surface-100 rounded-ads-md p-1 border border-default flex-1 sm:flex-none">
              {timeRanges.map((t) => (
                <button
                  key={t.id}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-ads-sm text-xs font-semibold text-accent bg-accent/10 border border-accent/20"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoadingLeaderboard ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          /* PREMIUM CINEMATIC EMPTY STATE */
          <div className="relative rounded-[24px] border border-default bg-surface-100/30 p-16 text-center overflow-hidden min-h-[350px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIi8+PC9zdmc+')] mix-blend-overlay" />
            <div className="absolute w-[200px] h-[200px] bg-accent/5 rounded-full filter blur-[50px] animate-pulse" />
            
            <div className="relative z-10 space-y-5 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto relative">
                <Trophy className="w-6 h-6 text-accent/40 animate-bounce" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-text">
                  No rankings generated yet
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Active contributions and transmissions generate gravity ranks. Speak first on text channels and build your Aurev Score parameters.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Podium layout */}
            <div className="grid grid-cols-3 gap-3.5 items-end pt-12 pb-6 max-w-xl mx-auto select-none">
              
              {/* Rank 2 */}
              {top2 ? (
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer mb-2.5">
                    <div className="ring-2 ring-gray-400 rounded-full p-0.5 shadow-glow-cyan/5">
                      <Avatar src={top2.profilePic} name={top2.fullName} size="lg" aurevTier={top2.tier} showOnlineIndicator={false} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center border border-surface text-[10px] font-bold text-surface">
                      2
                    </div>
                  </div>
                  <div className="w-full bg-surface-100/60 rounded-t-ads-lg border-t border-l border-r border-default p-4 text-center space-y-1 h-32 flex flex-col justify-center">
                    <p className="text-xs font-bold text-text truncate">@{top2.username}</p>
                    <p className="text-[10px] font-mono text-gray-400">{top2.aurevScore.toLocaleString()} AU</p>
                    <p className="text-[8px] font-bold text-text-muted uppercase">Silver Tier</p>
                  </div>
                </div>
              ) : <div />}

              {/* Rank 1 */}
              {top1 ? (
                <div className="flex flex-col items-center -translate-y-2">
                  <div className="relative group cursor-pointer mb-2">
                    <Crown className="w-6 h-6 text-accent animate-float absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(245,197,24,0.4)]" />
                    <div className="ring-3 ring-accent rounded-full p-0.5 shadow-glow-accent/15">
                      <Avatar src={top1.profilePic} name={top1.fullName} size="xl" aurevTier={top1.tier} showOnlineIndicator={false} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center border border-surface text-xs font-black text-surface">
                      1
                    </div>
                  </div>
                  
                  <div className="w-full bg-surface-100/80 rounded-t-ads-lg border-t border-l border-r border-accent/30 p-4 text-center space-y-1.5 h-38 shadow-glow-accent/5 flex flex-col justify-center">
                    <p className="text-xs font-bold text-accent truncate">@{top1.username}</p>
                    <p className="text-sm font-black text-text font-mono">{top1.aurevScore.toLocaleString()} AU</p>
                    <p className="text-[8px] font-bold text-accent uppercase tracking-widest">Legend Tier</p>
                  </div>
                </div>
              ) : <div />}

              {/* Rank 3 */}
              {top3 ? (
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer mb-2.5">
                    <div className="ring-2 ring-orange-800 rounded-full p-0.5">
                      <Avatar src={top3.profilePic} name={top3.fullName} size="lg" aurevTier={top3.tier} showOnlineIndicator={false} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-800 flex items-center justify-center border border-surface text-[10px] font-bold text-surface">
                      3
                    </div>
                  </div>
                  <div className="w-full bg-surface-100/60 rounded-t-ads-lg border-t border-l border-r border-default p-4 text-center space-y-1 h-28 flex flex-col justify-center">
                    <p className="text-xs font-bold text-text truncate">@{top3.username}</p>
                    <p className="text-[10px] font-mono text-orange-800">{top3.aurevScore.toLocaleString()} AU</p>
                    <p className="text-[8px] font-bold text-text-muted uppercase">Bronze Tier</p>
                  </div>
                </div>
              ) : <div />}

            </div>

            {/* Table Ranks 4+ */}
            {listUsers.length > 0 && (
              <div className="ads-surface overflow-hidden">
                <div className="divide-y divide-border">
                  {listUsers.map((user) => {
                    return (
                      <div
                        key={user._id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-200/30 transition-colors"
                      >
                        <div className="w-8 text-center font-bold text-xs text-text-muted font-mono">
                          #{user.rank}
                        </div>

                        <Avatar src={user.profilePic} name={user.fullName} size="sm" aurevTier={user.tier} showOnlineIndicator={false} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-text truncate">
                            {user.fullName}
                          </div>
                          <div className="text-[9px] font-mono text-text-muted leading-tight mt-0.5">@{user.username}</div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-xs text-text font-mono">{user.aurevScore.toLocaleString()}</div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <TrendIcon trend={user.trend} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Timeline */}
        <div className="ads-surface p-6 space-y-6">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b border-default pb-3">
            <Zap size={13} className="text-accent" /> Your Journey Milestones
          </h3>
          
          <div className="relative border-l border-default pl-4 space-y-6 py-2 ml-2">
            {journeyMilestones.map((milestone) => (
              <div key={milestone.id} className={`relative space-y-1 ${!milestone.unlocked ? 'opacity-40' : ''}`}>
                
                {/* Connector dot */}
                <div className={`absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                  milestone.unlocked 
                    ? 'bg-accent border-accent ring-4 ring-accent/10' 
                    : 'bg-surface border-default/80'
                }`} />

                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                    {milestone.label}
                    {!milestone.unlocked && <Lock size={10} className="text-text-muted" />}
                  </h4>
                  <span className="text-[9px] font-mono text-text-muted shrink-0">{milestone.date}</span>
                </div>
                <p className="text-[10px] text-text-secondary leading-relaxed">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AurevRankPage;
