import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFriendStore } from '../store/useFriendStore';
import {
  Camera, Save, ArrowLeft, Users, MessageSquare,
  Calendar, Trophy, Crown, Shield, Radio, Sparkles, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Badge from '../components/atoms/Badge';

const achievementsList = [
  { id: 'first_spike', label: 'First Spike', desc: 'Sent first frequency message', unlocked: true, icon: Sparkles, color: 'text-accent bg-accent/10' },
  { id: 'gravity_anchor', label: 'Gravity Anchor', desc: 'Accumulated 10,000+ Aurev Score', unlocked: true, icon: Crown, color: 'text-cyan bg-cyan/10' },
  { id: 'night_owl', label: 'Night Owl', desc: 'Active after midnight in Orbit', unlocked: true, icon: Shield, color: 'text-indigo-400 bg-indigo-400/10' },
  { id: 'room_creator', label: 'Station Master', desc: 'Established first custom room', unlocked: false, icon: Radio, color: 'text-rose bg-rose/10' },
];

const bannerGradients = [
  { id: 'gold-eclipse', label: 'Gold Eclipse', style: 'from-accent/40 via-surface-100 to-transparent' },
  { id: 'cosmic-cyan', label: 'Cosmic Cyan', style: 'from-cyan-900/40 via-surface-100 to-transparent' },
  { id: 'void-black', label: 'Void Black', style: 'from-[#080808] to-transparent' },
];

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { friends } = useFriendStore();
  const navigate = useNavigate();
  
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(
    localStorage.getItem('aurev-profile-banner') || 'gold-eclipse'
  );

  useEffect(() => {
    setHasChanges(fullName !== (authUser?.fullName || ''));
  }, [fullName, authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setSelectedImg(reader.result);
  };

  const handleSavePhoto = async () => {
    if (!selectedImg) return;
    setIsSaving(true);
    try {
      await updateProfile({ profilePic: selectedImg });
      setSelectedImg(null);
      toast.success('Profile photo updated');
    } catch { 
      toast.error('Failed to update photo'); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ fullName });
      toast.success('Profile updated');
    } catch { 
      toast.error('Failed to update profile'); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleBannerSelect = (bannerId) => {
    setSelectedBanner(bannerId);
    localStorage.setItem('aurev-profile-banner', bannerId);
    toast.success('Gravity banner theme synced!');
  };

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2026';

  const activeBanner = bannerGradients.find(b => b.id === selectedBanner) || bannerGradients[0];

  const recentAurevs = [
    { text: "Spoke in #general inside Vercel Orbit", date: "Just now" },
    { text: "Reached Level 2 Aurev Rank parameter", date: "2 days ago" },
    { text: "Activated Sovereign ID keys", date: "3 days ago" },
  ];

  return (
    <div className="min-h-screen pt-8 pb-12 px-6 bg-surface overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-6 text-sm">
          <ArrowLeft size={18} /> Back to Chat
        </button>

        <div className="ads-surface overflow-hidden shadow-elevation-2 relative">
          
          {/* Customizable Gradient Banner */}
          <div className={`h-32 bg-gradient-to-r ${activeBanner.style} relative border-b border-default`}>
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />
            
            {/* Banner Selectors Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-surface-100/80 backdrop-blur-md rounded-ads-sm border border-default">
              {bannerGradients.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBannerSelect(b.id)}
                  title={`Switch banner theme: ${b.label}`}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    b.id === 'gold-eclipse' ? 'bg-accent' : b.id === 'cosmic-cyan' ? 'bg-cyan' : 'bg-surface-300'
                  } ${selectedBanner === b.id ? 'border-text scale-110' : 'border-transparent hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="px-8 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10 border-b border-default">
            <div className="relative group bg-surface p-1 rounded-full ring-2 ring-accent shadow-glow-accent/15">
              <div className="w-24 h-24 rounded-full overflow-hidden shrink-0">
                {selectedImg || (authUser?.profilePic && !authUser.profilePic.includes('avatar.png')) ? (
                  <img src={selectedImg || authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Avatar src={null} name={authUser?.fullName} size="xl" online={false} />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-accent hover:bg-accent p-2 rounded-full cursor-pointer transition-all shadow-glow-accent group-hover:scale-110"
              >
                <Camera className="w-3.5 h-3.5 text-surface" />
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile} />
              </label>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div>
                <h1 className="text-xl font-extrabold text-text tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  {fullName || authUser?.fullName}
                </h1>
                <p className="text-xxs text-text-muted font-mono">@{authUser?.fullName.split(' ')[0].toLowerCase()}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <Badge variant="accent" size="md">
                  <Trophy size={11} className="mr-1.5" /> Legend Tier
                </Badge>
                <span className="flex items-center gap-1.5 text-xxs text-text-secondary bg-surface-200 border border-default px-2 py-0.5 rounded font-mono">
                  <Calendar size={11} className="text-text-muted" />
                  <span>Joined {memberSince}</span>
                </span>
              </div>
            </div>

            {selectedImg && (
              <div className="flex gap-2 pt-4 sm:pt-0">
                <Button variant="accent" size="sm" icon={<Save size={13} />} loading={isSaving} onClick={handleSavePhoto}>
                  Save Photo
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedImg(null)} disabled={isSaving} className="border border-default">
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-default bg-surface-50/20">
            {[
              { icon: Users, label: 'Friends', value: friends?.length || 0 },
              { icon: MessageSquare, label: 'Conversations', value: '14' },
              { icon: Trophy, label: 'Aurev Score', value: '4,280' },
            ].map((stat, i) => (
              <div key={i} className="px-4 py-4 text-center">
                <stat.icon className="w-4.5 h-4.5 text-accent/40 mx-auto mb-1.5" />
                <div className="text-sm font-bold text-text">{stat.value}</div>
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Edit Fields */}
          <div className="p-8 space-y-6">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
              <div className="w-full px-4 py-3 rounded-ads-md bg-surface-100 border border-default text-text-muted text-sm">
                {authUser?.email}
              </div>
            </div>

            {hasChanges && (
              <div className="flex justify-end pt-2">
                <Button variant="accent" icon={<Save size={14} />} loading={isSaving} onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            )}
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
                        : 'bg-surface border-default/50 opacity-40'
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

          {/* Recent Aurevs Timeline Feed */}
          <div className="ads-surface p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b border-default pb-3">
              <Activity size={12} className="text-cyan" /> Milestones Timeline
            </h3>
            
            <div className="relative border-l border-default pl-4 space-y-5 py-1.5 ml-2">
              {recentAurevs.map((log, index) => (
                <div key={index} className="relative space-y-1">
                  <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-accent ring-4 ring-accent/10 shadow-glow-accent/10" />
                  <p className="text-xs text-text-secondary leading-relaxed">{log.text}</p>
                  <p className="text-[9px] font-mono text-text-muted">{log.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
