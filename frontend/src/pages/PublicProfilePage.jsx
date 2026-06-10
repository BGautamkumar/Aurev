import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFriendStore } from '../store/useFriendStore';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MessageSquare, Sparkles,
  Trophy, Calendar, Users, Crown, Shield, Activity
} from 'lucide-react';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';

const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { friends, sendFriendRequest } = useFriendStore();
  const { setSelectedUser } = useChatStore();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/auth/users/${id}`);
        setProfileUser(res.data);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Failed to load user profile");
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserProfile();
  }, [id, navigate]);

  if (loading || !profileUser) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--base)' }}>
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-base)' }} />
          <p className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Aligning profile frequency...</p>
        </div>
      </div>
    );
  }

  const handleOpenChat = () => {
    setSelectedUser(profileUser);
    navigate(`/messages/${profileUser._id}`);
  };

  const getTierDetails = (tier = 'bronze') => {
    switch (tier.toLowerCase()) {
      case 'legend':   return { label: 'Nova',     color: 'var(--tier-nova)',     ring: '2px solid var(--tier-nova)', glow: '0 0 20px rgba(255,255,255,0.15)' };
      case 'diamond':  return { label: 'Orbit',    color: 'var(--tier-orbit)',    ring: '2px solid var(--tier-orbit)', glow: '0 0 20px var(--accent-subtle)' };
      case 'platinum': return { label: 'Orbit',    color: 'var(--tier-orbit)',    ring: '2px solid var(--tier-orbit)', glow: '0 0 16px var(--accent-subtle)' };
      case 'gold':     return { label: 'Pulse',    color: 'var(--tier-pulse)',    ring: '2px solid var(--tier-pulse)', glow: '0 0 12px var(--accent-subtle)' };
      case 'silver':   return { label: 'Signal',   color: 'var(--tier-signal)',   ring: '2px solid var(--tier-signal)', glow: 'none' };
      default:         return { label: 'Initiate', color: 'var(--tier-initiate)', ring: '2px solid var(--tier-initiate)', glow: 'none' };
    }
  };

  const tier = profileUser.aurevTier || 'bronze';
  const tierDetails = getTierDetails(tier);
  const joinDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const achievementsList = [
    { id: 'first_spike', label: 'First Spike', desc: 'Sent first frequency message', unlocked: profileUser.aurevScore > 0, icon: Sparkles },
    { id: 'gravity_anchor', label: 'Gravity Anchor', desc: 'Accumulated 1,000+ Aurev Score', unlocked: profileUser.aurevScore >= 1000, icon: Crown },
    { id: 'silver_badge', label: 'Signal Node', desc: 'Reached Signal tier status', unlocked: profileUser.aurevScore >= 100, icon: Shield },
  ];

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
      <motion.div
        className="max-w-2xl mx-auto px-6 pt-8 pb-16 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back */}
        <motion.div variants={itemVariants}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={18} /> Back
          </button>
        </motion.div>

        {/* Profile Card */}
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
            {/* Banner */}
            <div className="h-32 relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--base), transparent)' }} />
              <div className="absolute inset-0 charged-noise" style={{ opacity: 0.04 }} />
            </div>

            {/* Identity */}
            <div className="px-8 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10">
              <div
                className="rounded-full shrink-0 p-0.5"
                style={{
                  background: 'var(--surface)',
                  border: tierDetails.ring,
                  boxShadow: tierDetails.glow,
                }}
              >
                <Avatar src={profileUser.profilePic} name={profileUser.fullName} size="xl" online={false} />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{profileUser.fullName}</h1>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>@{profileUser.email.split('@')[0]}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span
                    className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-widest"
                    style={{
                      background: `${tierDetails.color}15`,
                      color: tierDetails.color,
                      border: `1px solid ${tierDetails.color}30`,
                    }}
                  >
                    {tierDetails.label} Tier
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <Calendar size={10} /> Joined {joinDate}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0 pt-4 sm:pt-0">
                <Button variant="accent" size="sm" icon={<MessageSquare size={13} />} onClick={handleOpenChat}>
                  Message
                </Button>
                {!friends.some(f => f._id === profileUser._id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await sendFriendRequest(profileUser._id);
                      } catch {
                        // Handled by store
                      }
                    }}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div
            className="p-4 text-center space-y-1"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Users size={11} style={{ color: 'var(--accent-base)' }} /> Status Level
            </span>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{tierDetails.label.toUpperCase()}</p>
          </div>
          <div
            className="p-4 text-center space-y-1"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-xl)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1" style={{ color: 'var(--accent-base)' }}>
              <Trophy size={11} /> Aurev Score
            </span>
            <p className="text-lg font-black font-mono" style={{ color: 'var(--accent-base)' }}>{(profileUser.aurevScore || 0).toLocaleString()} AU</p>
          </div>
        </motion.div>

        {/* Two Columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Badges */}
          <motion.div variants={itemVariants}>
            <div
              className="p-5 space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pb-3" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                <Crown size={12} style={{ color: 'var(--accent-base)' }} /> Earned Badges
              </h3>
              <div className="space-y-2.5">
                {achievementsList.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${!badge.unlocked ? 'opacity-35' : ''}`}
                      style={{ background: badge.unlocked ? 'var(--elevated)' : 'transparent', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: badge.unlocked ? 'var(--accent-subtle)' : 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <BadgeIcon size={14} style={{ color: badge.unlocked ? 'var(--accent-base)' : 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          {badge.label}
                          {!badge.unlocked && <span className="text-[8px] font-mono px-1 py-0.5 rounded uppercase" style={{ background: 'var(--overlay)', color: 'var(--text-muted)' }}>Locked</span>}
                        </h4>
                        <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-secondary)' }}>{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div variants={itemVariants}>
            <div
              className="p-5 space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pb-3" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                <Activity size={12} style={{ color: 'var(--accent-base)' }} /> Recent Activity
              </h3>
              <div className="text-center py-10">
                <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No recent signals recorded.</p>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default PublicProfilePage;
