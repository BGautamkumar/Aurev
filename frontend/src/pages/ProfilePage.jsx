import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFriendStore } from '../store/useFriendStore';
import { motion } from 'framer-motion';
import {
  Camera, Save, Users, MessageSquare,
  Calendar, Trophy, Crown, Shield, Radio, Sparkles, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';

const achievementsList = [
  { id: 'first_spike', label: 'First Spike', desc: 'Sent first frequency message', unlocked: true, icon: Sparkles },
  { id: 'gravity_anchor', label: 'Gravity Anchor', desc: 'Accumulated 10,000+ Aurev Score', unlocked: true, icon: Crown },
  { id: 'night_owl', label: 'Night Owl', desc: 'Active after midnight in Orbit', unlocked: true, icon: Shield },
  { id: 'room_creator', label: 'Station Master', desc: 'Established first custom room', unlocked: false, icon: Radio },
];

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { friends } = useFriendStore();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2026';

  const recentAurevs = [
    { text: "Spoke in #general inside Vercel Orbit", date: "Just now" },
    { text: "Reached Level 2 Aurev Rank parameter", date: "2 days ago" },
    { text: "Activated Sovereign ID keys", date: "3 days ago" },
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

        {/* ── Profile Card ── */}
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
            <div className="h-36 relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--base), transparent)' }} />
              <div className="absolute inset-0 charged-noise" style={{ opacity: 0.04 }} />
              {/* Animated ambient */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full animate-mesh-shift"
                style={{ background: 'radial-gradient(circle, var(--accent-subtle), transparent 70%)', filter: 'blur(40px)' }}
              />
            </div>

            {/* Identity Block */}
            <div className="px-8 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12" style={{ borderBottom: '1px solid var(--border)' }}>
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden p-0.5"
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid var(--accent-base)',
                    boxShadow: '0 0 20px var(--accent-strong)',
                  }}
                >
                  {selectedImg || (authUser?.profilePic && !authUser.profilePic.includes('avatar.png')) ? (
                    <img src={selectedImg || authUser.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Avatar src={null} name={authUser?.fullName} size="xl" online={false} />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-[0.92]"
                  style={{
                    background: 'var(--accent-base)',
                    color: 'var(--void)',
                    boxShadow: '0 2px 8px var(--accent-subtle)',
                  }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile} />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {fullName || authUser?.fullName}
                </h1>
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>@{authUser?.fullName.split(' ')[0].toLowerCase()}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span
                    className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-widest"
                    style={{
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent-base)',
                      border: '1px solid var(--accent-subtle)',
                    }}
                  >
                    <Trophy size={10} className="inline mr-1" /> Signal Tier
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <Calendar size={10} /> Joined {memberSince}
                  </span>
                </div>
              </div>

              {selectedImg && (
                <div className="flex gap-2 pt-4 sm:pt-0">
                  <Button variant="accent" size="sm" icon={<Save size={13} />} loading={isSaving} onClick={handleSavePhoto}>
                    Save Photo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedImg(null)} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid var(--border)' }}>
              {[
                { icon: Users, label: 'Friends', value: friends?.length || 0 },
                { icon: MessageSquare, label: 'Conversations', value: '14' },
                { icon: Trophy, label: 'Aurev Score', value: '4,280' },
              ].map((stat, i) => (
                <div key={i} className="px-4 py-4 text-center" style={{ borderColor: 'var(--border)' }}>
                  <stat.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: 'var(--border-mid)' }} />
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
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
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
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
        </motion.div>

        {/* ── Two Column Content ── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Earned Badges */}
          <motion.div variants={itemVariants}>
            <div
              className="p-5 space-y-4"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-card)',
              }}
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
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-fast ${!badge.unlocked ? 'opacity-35' : ''}`}
                      style={{
                        background: badge.unlocked ? 'var(--elevated)' : 'transparent',
                        border: `1px solid ${badge.unlocked ? 'var(--border)' : 'var(--border)'}`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: badge.unlocked ? 'var(--accent-subtle)' : 'var(--surface)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <BadgeIcon size={14} style={{ color: badge.unlocked ? 'var(--accent-base)' : 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          {badge.label}
                          {!badge.unlocked && (
                            <span className="text-[8px] font-mono px-1 py-0.5 rounded uppercase" style={{ background: 'var(--overlay)', color: 'var(--text-muted)' }}>Locked</span>
                          )}
                        </h4>
                        <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-secondary)' }}>{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Milestones Timeline */}
          <motion.div variants={itemVariants}>
            <div
              className="p-5 space-y-4"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pb-3" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                <Activity size={12} style={{ color: 'var(--accent-base)' }} /> Milestones Timeline
              </h3>
              <div className="relative pl-4 space-y-5 py-1.5 ml-2" style={{ borderLeft: '1px solid var(--border)' }}>
                {recentAurevs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                    className="relative space-y-1"
                  >
                    <div
                      className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full"
                      style={{
                        background: 'var(--accent-base)',
                        boxShadow: '0 0 0 4px var(--accent-subtle), 0 0 8px var(--accent-subtle)',
                      }}
                    />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{log.text}</p>
                    <p className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{log.date}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default ProfilePage;
