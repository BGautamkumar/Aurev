import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFriendStore } from '../store/useFriendStore';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axios';
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

    if (id) {
      fetchUserProfile();
    }
  }, [id, navigate]);

  if (loading || !profileUser) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm font-mono uppercase tracking-widest">Aligning profile frequency...</p>
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
      case 'legend': return { label: 'Legend Tier', style: 'text-accent bg-accent/10 border-accent/25', ring: 'ring-2 ring-accent shadow-glow-accent/15' };
      case 'diamond': return { label: 'Diamond Tier', style: 'text-cyan bg-cyan/10 border-cyan/25', ring: 'ring-2 ring-cyan shadow-glow-cyan/15' };
      case 'platinum': return { label: 'Platinum Tier', style: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/25', ring: 'ring-2 ring-indigo-400/50' };
      case 'gold': return { label: 'Gold Tier', style: 'text-accent-hover bg-accent-hover/10 border-accent-hover/20', ring: 'ring-1 ring-accent-hover/30' };
      default: return { label: 'Bronze Tier', style: 'text-orange-600 bg-orange-600/10 border-orange-600/20', ring: 'ring-1 ring-orange-600/10' };
    }
  };

  const tier = profileUser.aurevTier || 'bronze';
  const tierDetails = getTierDetails(tier);
  const joinDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Dynamic achievements based on user's real points
  const achievementsList = [
    { id: 'first_spike', label: 'First Spike', desc: 'Sent first frequency message', unlocked: profileUser.aurevScore > 0, icon: Sparkles, color: 'text-accent bg-accent/10' },
    { id: 'gravity_anchor', label: 'Gravity Anchor', desc: 'Accumulated 1,000+ Aurev Score', unlocked: profileUser.aurevScore >= 1000, icon: Crown, color: 'text-cyan bg-cyan/10' },
    { id: 'silver_badge', label: 'Silver Node', desc: 'Reached Silver tier status parameters', unlocked: profileUser.aurevScore >= 100, icon: Shield, color: 'text-indigo-400 bg-indigo-400/10' },
  ];

  return (
    <div className="h-full pt-8 pb-12 px-6 bg-surface overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="ads-surface overflow-hidden shadow-elevation-2 relative">
          {/* Custom Banner Background */}
          <div className="h-32 bg-gradient-to-r from-accent/40 via-cyan-900/20 to-transparent relative border-b border-default">
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />
          </div>

          {/* Profile Header Details */}
          <div className="px-8 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10">
            <div className={`rounded-full shrink-0 relative bg-surface p-1 ${tierDetails.ring}`}>
              <Avatar
                src={profileUser.profilePic}
                name={profileUser.fullName}
                size="xl"
                online={false}
              />
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h1 className="text-xl font-extrabold text-text tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  {profileUser.fullName}
                </h1>
                <p className="text-xxs text-text-muted font-mono mt-0.5">@{profileUser.email.split('@')[0]}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${tierDetails.style}`}>
                  {tierDetails.label}
                </span>
                <span className="flex items-center gap-1.5 text-xxs text-text-secondary bg-surface-200 border border-default px-2 py-0.5 rounded font-mono">
                  <Calendar size={11} className="text-text-muted" />
                  <span>Joined {joinDate}</span>
                </span>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="flex items-center gap-2.5 shrink-0 pt-4 sm:pt-0">
              <Button
                variant="accent"
                size="sm"
                icon={<MessageSquare size={13} />}
                onClick={handleOpenChat}
              >
                Message
              </Button>
              {!friends.some(f => f._id === profileUser._id) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-surface-200 border border-default hover:bg-surface-300"
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="ads-surface p-4 text-center space-y-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center justify-center gap-1">
              <Users size={11} className="text-cyan" /> Status Level
            </span>
            <p className="text-sm font-bold text-text mt-1">{tier.toUpperCase()}</p>
          </div>
          <div className="ads-surface p-4 text-center space-y-1 bg-accent/5 border border-accent/20">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center justify-center gap-1">
              <Trophy size={11} className="text-accent" /> Aurev Score
            </span>
            <p className="text-lg font-black font-mono text-accent">{(profileUser.aurevScore || 0).toLocaleString()} AU</p>
          </div>
        </div>

        {/* Dynamic Columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Achievements Grid */}
          <div className="ads-surface p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b border-default pb-3">
              <Crown size={12} className="text-accent" /> Earned Badges
            </h3>
            
            <div className="grid grid-cols-1 gap-2.5">
              {achievementsList.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className={`flex items-start gap-3 p-3 rounded-ads-md border transition-all duration-200 ${
                      badge.unlocked 
                        ? 'bg-surface-100 border-default' 
                        : 'bg-surface border-default/50 opacity-40 select-none'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-ads-sm flex items-center justify-center shrink-0 border border-default/40 ${badge.color}`}>
                      <BadgeIcon size={14} className={badge.unlocked ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                        {badge.label}
                        {!badge.unlocked && <span className="text-[8px] font-mono text-text-muted bg-surface-200 px-1 py-0.5 rounded uppercase">Locked</span>}
                      </h4>
                      <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Aurevs Activity Feed */}
          <div className="ads-surface p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b border-default pb-3">
              <Activity size={12} className="text-cyan" /> Recent Activity
            </h3>
            
            <div className="text-center py-10">
              <Activity className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
              <p className="text-xs text-text-muted">No recent signals recorded.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfilePage;
