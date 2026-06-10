import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAurevStore } from '../store/useAurevStore';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, TrendingDown, Minus,
  Users, Globe, Crown, Zap, Shield, Lock
} from 'lucide-react';
import Avatar from '../components/atoms/Avatar';

/* ── Tier Config (Charged Dark) ── */
const tierConfig = {
  bronze:   { label: 'Initiate',  color: 'var(--tier-initiate)', gradient: 'linear-gradient(135deg, #475569, #64748B)', icon: Shield },
  silver:   { label: 'Signal',    color: 'var(--tier-signal)',   gradient: 'linear-gradient(135deg, var(--accent-subtle), var(--border-mid))', icon: Shield },
  gold:     { label: 'Pulse',     color: 'var(--tier-pulse)',    gradient: 'linear-gradient(135deg, var(--border-mid), var(--accent-base))', icon: Crown },
  diamond:  { label: 'Orbit',     color: 'var(--tier-orbit)',    gradient: 'linear-gradient(135deg, var(--accent-base), var(--accent-base))', icon: Zap },
  legend:   { label: 'Nova',      color: 'var(--tier-nova)',     gradient: 'linear-gradient(135deg, var(--accent-base), #FFFFFF)', icon: Trophy },
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp size={14} style={{ color: 'var(--success)' }} />;
  if (trend === 'down') return <TrendingDown size={14} style={{ color: 'var(--danger)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-muted)' }} />;
};

/* ── Animated Counter ── */
const AnimatedScore = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = value || 0;
    const duration = 900;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
};

const AurevRankPage = () => {
  const navigate = useNavigate();
  const { authUser, socket } = useAuthStore();
  const {
    aurevScore, aurevTier, aurevRank, leaderboard,
    isLoadingLeaderboard, getAurevScore, getLeaderboard,
    subscribeToAurevUpdates, unsubscribeFromAurevUpdates
  } = useAurevStore();

  const [filter, setFilter] = useState('global');

  useEffect(() => { getAurevScore(); }, [getAurevScore]);
  useEffect(() => { getLeaderboard(filter, 'all'); }, [getLeaderboard, filter]);
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
  const TierIcon = myTierConfig.icon;

  const getNextTierThreshold = (tier) => {
    switch (tier) {
      case 'bronze': return { label: 'Signal', score: 100 };
      case 'silver': return { label: 'Pulse', score: 500 };
      case 'gold':   return { label: 'Orbit', score: 2000 };
      case 'diamond': return { label: 'Nova', score: 5000 };
      default: return { label: 'Max Level', score: 5000 };
    }
  };
  const nextTier = getNextTierThreshold(myTier);
  const percentToNext = nextTier.score > myScore ? (myScore / nextTier.score) * 100 : 100;

  const filters = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'friends', label: 'Friends', icon: Users },
  ];

  const journeyMilestones = [
    { id: 'm1', label: 'First Spike Spoken', desc: 'Broadcasted first message on the network', unlocked: myScore > 0 },
    { id: 'm2', label: 'Reached Signal Status', desc: 'Crossed 100 Aurev Score parameters', unlocked: myScore >= 100 },
    { id: 'm3', label: 'Reached Pulse Status', desc: 'Crossed 500 Aurev Score parameters', unlocked: myScore >= 500 },
  ];

  const top1 = leaderboard.find(u => u.rank === 1);
  const top2 = leaderboard.find(u => u.rank === 2);
  const top3 = leaderboard.find(u => u.rank === 3);
  const listUsers = leaderboard.filter(u => u.rank > 3);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <div className="h-full overflow-y-auto charged-scrollbar" style={{ background: 'var(--base)' }}>
      <div className="absolute inset-0 charged-noise pointer-events-none" />
      <motion.div
        className="max-w-3xl mx-auto px-6 pt-8 pb-16 space-y-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* ═══════════════════════════════════════
           PERSONAL SCORE HERO
           ═══════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div
            className="relative overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, var(--accent-subtle), transparent 60%)' }} />
            <div className="absolute inset-0 charged-noise" />

            <div className="relative z-10 p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar with tier ring */}
                <div className="relative flex-shrink-0">
                  <Avatar src={authUser?.profilePic} name={authUser?.fullName} size="xl" aurevTier={myTier} showOnlineIndicator={false} />
                  <div
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: myTierConfig.gradient,
                      border: '2px solid var(--surface)',
                      boxShadow: `0 0 12px ${myTierConfig.color}40`,
                    }}
                  >
                    <TierIcon size={14} style={{ color: 'var(--void)' }} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-3">
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{authUser?.fullName}</h2>
                    <span
                      className="text-[10px] font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded-md"
                      style={{
                        background: `${myTierConfig.color}15`,
                        color: myTierConfig.color,
                        border: `1px solid ${myTierConfig.color}30`,
                      }}
                    >
                      {myTierConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-6">
                    <div>
                      <span
                        className="font-mono font-black tracking-tight charged-text-gradient"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}
                      >
                        <AnimatedScore value={myScore} />
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest ml-2" style={{ color: 'var(--text-muted)' }}>AU</span>
                    </div>
                    <div className="w-px h-10" style={{ background: 'var(--border)' }} />
                    <div>
                      <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>#{myRank}</span>
                      <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Global</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {myTier !== 'legend' && (
                <div className="mt-8">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
                    <span>{myTierConfig.label}</span>
                    <span>{nextTier.label} — {nextTier.score} pts</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--elevated)' }}>
                    <div
                      className="h-full rounded-full animate-progress-fill"
                      style={{
                        width: `${percentToNext}%`,
                        background: `linear-gradient(90deg, var(--accent-subtle), var(--accent-base))`,
                        boxShadow: '0 0 12px var(--accent-subtle)',
                      }}
                    />
                  </div>
                  <div className="text-[11px] font-mono mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {nextTier.score - myScore} pts to next tier
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
           LEADERBOARD SECTION
           ═══════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Trophy size={18} style={{ color: 'var(--accent-base)' }} /> Orbital Leaderboard
            </h2>

            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}>
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-fast"
                  style={{
                    background: filter === f.id ? 'var(--surface)' : 'transparent',
                    color: filter === f.id ? 'var(--accent-base)' : 'var(--text-secondary)',
                    boxShadow: filter === f.id ? 'var(--shadow-spatial-sm)' : 'none',
                  }}
                >
                  <f.icon size={12} /> {f.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoadingLeaderboard ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-base)' }} />
          </div>
        ) : leaderboard.length === 0 ? (
          /* Empty State */
          <motion.div variants={itemVariants}>
            <div
              className="relative overflow-hidden text-center py-16 flex flex-col items-center justify-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div className="absolute inset-0 charged-noise" />
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute w-full h-full rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-strong)' }} />
                <div className="absolute w-full h-full rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-subtle)', animationDelay: '0.7s' }} />
                <div className="absolute w-full h-full rounded-full border animate-radar-expand" style={{ borderColor: 'var(--accent-subtle)', animationDelay: '1.4s' }} />
                <Trophy className="w-8 h-8 relative z-10" strokeWidth={1.5} style={{ color: 'var(--border-mid)' }} />
              </div>
              <h3 className="text-lg font-semibold relative z-10" style={{ color: 'var(--text-primary)' }}>No rankings generated yet</h3>
              <p className="text-xs mt-2 max-w-xs relative z-10" style={{ color: 'var(--text-muted)' }}>
                Active contributions generate gravity ranks. Speak first and build your Aurev Score.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ── Podium ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3.5 items-end pt-8 pb-4 max-w-xl mx-auto select-none">
              {/* #2 */}
              <PodiumCard user={top2} rank={2} />
              {/* #1 — elevated */}
              <PodiumCard user={top1} rank={1} champion />
              {/* #3 */}
              <PodiumCard user={top3} rank={3} />
            </motion.div>

            {/* ── Rank 4+ List ── */}
            {listUsers.length > 0 && (
              <motion.div variants={itemVariants}>
                <div
                  className="overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {listUsers.map((user, i) => {
                    const isMe = user._id === authUser?._id;
                    return (
                      <div
                        key={user._id}
                        className="flex items-center gap-4 px-5 py-3.5 transition-all duration-fast cursor-pointer"
                        style={{
                          borderBottom: i < listUsers.length - 1 ? '1px solid var(--border)' : 'none',
                          background: isMe ? 'var(--accent-subtle)' : 'transparent',
                          borderLeft: isMe ? '3px solid var(--accent-base)' : '3px solid transparent',
                        }}
                        onClick={() => navigate(`/profile/${user._id}`)}
                        onMouseEnter={(e) => { if (!isMe) e.currentTarget.style.background = 'var(--elevated)'; }}
                        onMouseLeave={(e) => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="w-8 text-center font-bold text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          #{user.rank}
                        </div>
                        <Avatar src={user.profilePic} name={user.fullName} size="sm" aurevTier={user.tier} showOnlineIndicator={false} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs truncate" style={{ color: isMe ? 'var(--accent-base)' : 'var(--text-primary)' }}>
                            {user.fullName} {isMe && <span className="text-[9px] font-mono opacity-60">(you)</span>}
                          </div>
                          <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>@{user.username}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{user.aurevScore.toLocaleString()}</div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <TrendIcon trend={user.trend} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════
           MILESTONES TIMELINE
           ═══════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <div
            className="p-6 space-y-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pb-3" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
              <Zap size={13} style={{ color: 'var(--accent-base)' }} /> Your Journey Milestones
            </h3>

            <div className="relative pl-4 space-y-6 py-2 ml-2" style={{ borderLeft: '1px solid var(--border)' }}>
              {journeyMilestones.map((milestone, i) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                  className={`relative space-y-1 ${!milestone.unlocked ? 'opacity-35' : ''}`}
                >
                  {/* Connector dot */}
                  <div
                    className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: milestone.unlocked ? 'var(--accent-base)' : 'var(--surface)',
                      border: milestone.unlocked ? '2px solid var(--accent-base)' : '2px solid var(--border)',
                      boxShadow: milestone.unlocked ? '0 0 0 4px var(--accent-subtle), 0 0 8px var(--accent-subtle)' : 'none',
                    }}
                  />
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      {milestone.label}
                      {!milestone.unlocked && <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
                    </h4>
                    <span className="text-[9px] font-mono shrink-0" style={{ color: milestone.unlocked ? 'var(--accent-base)' : 'var(--text-muted)' }}>
                      {milestone.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{milestone.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

/* ── Podium Card ── */
const PodiumCard = ({ user, rank, champion }) => {
  if (!user) return <div />;
  const tierCfg = tierConfig[user.tier] || tierConfig.bronze;
  const heights = { 1: 'h-40', 2: 'h-32', 3: 'h-28' };
  const rankColors = {
    1: { bg: 'var(--accent-base)', shadow: '0 0 16px var(--accent-strong)' },
    2: { bg: 'var(--tier-initiate)', shadow: 'none' },
    3: { bg: 'var(--tier-initiate)', shadow: 'none' },
  };

  return (
    <div className={`flex flex-col items-center ${champion ? '-translate-y-3' : ''}`}>
      <div className="relative group cursor-pointer mb-2.5">
        {champion && (
          <Crown
            className="w-6 h-6 absolute -top-6 left-1/2 -translate-x-1/2 animate-float"
            style={{ color: 'var(--accent-base)', filter: 'drop-shadow(0 0 8px var(--accent-strong))' }}
          />
        )}
        <div
          className="rounded-full p-0.5"
          style={{
            boxShadow: champion ? '0 0 20px var(--accent-strong)' : 'none',
            border: champion ? '2px solid var(--accent-base)' : `2px solid ${tierCfg.color}`,
          }}
        >
          <Avatar src={user.profilePic} name={user.fullName} size={champion ? 'xl' : 'lg'} aurevTier={user.tier} showOnlineIndicator={false} />
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: rankColors[rank].bg,
            boxShadow: rankColors[rank].shadow,
            color: rank === 1 ? 'var(--void)' : 'var(--white-pure)',
            border: '2px solid var(--surface)',
          }}
        >
          {rank}
        </div>
      </div>

      <div
        className={`w-full ${heights[rank]} rounded-t-xl p-3 text-center flex flex-col justify-center space-y-1`}
        style={{
          background: champion ? 'var(--accent-subtle)' : 'var(--elevated)',
          borderTop: champion ? '1px solid var(--border-mid)' : '1px solid var(--border)',
          borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
          boxShadow: champion ? '0 -4px 20px var(--accent-subtle)' : 'none',
        }}
      >
        <p className="text-[11px] font-bold truncate" style={{ color: champion ? 'var(--accent-base)' : 'var(--text-primary)' }}>
          @{user.username}
        </p>
        <p className="text-[10px] font-mono font-bold" style={{ color: champion ? 'var(--accent-base)' : 'var(--text-secondary)' }}>
          {user.aurevScore.toLocaleString()} AU
        </p>
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: tierCfg.color }}>
          {tierCfg.label}
        </p>
      </div>
    </div>
  );
};

export default AurevRankPage;
