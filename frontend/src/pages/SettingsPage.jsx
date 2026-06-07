import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFriendStore } from '../store/useFriendStore';
import toast from 'react-hot-toast';
import {
  User, Shield, Bell, Palette, ArrowLeft, LogOut, Trash2,
  ChevronRight, Check, Eye, Lock,
  Fingerprint, Activity, Zap, Waves, Volume2
} from 'lucide-react';
import Button from '../components/atoms/Button';
import Toggle from '../components/atoms/Toggle';

// --- Subcomponents for Settings UI ---

const AmbientBackground = ({ activeTab }) => {
  const isDanger = activeTab === 'account';
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none transition-colors duration-1000 bg-surface-base">
      <div 
        className={`absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full mix-blend-[var(--ambient-overlay)] filter blur-[120px] animate-ambient-shift transition-all duration-1000 ${
          isDanger ? 'bg-rose-500 opacity-40' : 'bg-accent opacity-20'
        }`}
      />
      <div 
        className={`absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full mix-blend-[var(--ambient-overlay)] filter blur-[100px] animate-ambient-shift transition-all duration-1000 ${
          isDanger ? 'bg-red-700 opacity-40' : 'bg-accent-dim opacity-20'
        }`}
        style={{ animationDelay: '-15s' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-spatial-900 opacity-80" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
};

const Slider = ({ label, value, min, max, step = 1, onChange, unit = '', description }) => (
  <div className="space-y-3 group">
    <div className="flex justify-between items-end">
      <label className="text-sm font-medium text-text-secondary tracking-wide">{label}</label>
      <span className="font-mono text-xs text-text-muted">{value}{unit}</span>
    </div>
    <div className="relative h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden border border-default">
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent/50 to-accent rounded-full transition-all duration-300 ease-spatial"
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
    {description && <p className="text-xs text-text-muted/60 leading-relaxed max-w-md">{description}</p>}
  </div>
);

const SettingRow = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-center justify-between py-6 group border-b border-default/50 last:border-0 transition-colors hover:bg-border/20 px-4 -mx-4 rounded-2xl">
    <div className="flex items-start gap-5 max-w-lg">
      <div className="p-2.5 rounded-xl bg-surface/50 border border-default text-text-muted group-hover:text-text transition-colors shadow-inner-light">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-text">{title}</h4>
        {description && <p className="text-xs text-text-muted leading-relaxed">{description}</p>}
      </div>
    </div>
    <div className="pl-4">
      {children}
    </div>
  </div>
);

// --- Main Page ---

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, authUser, updateProfile } = useAuthStore();
  const { blockedUsers, getBlockedUsers, unblockUser } = useFriendStore();
  
  const { 
    theme, setTheme, 
    fontSize, setFontSize, 
    density, setDensity,
    motionIntensity, setMotionIntensity,
    glassTransparency, setGlassTransparency,
    uiSharpness, setUiSharpness
  } = useThemeStore();

  const getTabFromPath = () => {
    if (location.pathname.endsWith('/privacy')) return 'privacy';
    if (location.pathname.endsWith('/notifications')) return 'notifications';
    if (location.pathname.endsWith('/account')) return 'account';
    return 'appearance';
  };

  const activeTab = getTabFromPath();

  const handleTabChange = (tabId) => {
    if (tabId === 'appearance') navigate('/settings');
    else navigate(`/settings/${tabId}`);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: authUser?.privacy?.showOnlineStatus ?? true,
    readReceipts: authUser?.privacy?.readReceipts ?? true,
    profileVisibility: authUser?.privacy?.profileVisibility || 'public',
    allowDMsFrom: authUser?.privacy?.allowDMsFrom || 'friends',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    sounds: true,
    desktopAlerts: true,
  });

  useEffect(() => {
    if (authUser?.privacy) {
      setPrivacySettings({
        showOnlineStatus: authUser.privacy.showOnlineStatus ?? true,
        readReceipts: authUser.privacy.readReceipts ?? true,
        profileVisibility: authUser.privacy.profileVisibility || 'public',
        allowDMsFrom: authUser.privacy.allowDMsFrom || 'friends',
      });
    }
  }, [authUser]);

  useEffect(() => {
    if (activeTab === 'privacy') getBlockedUsers();
  }, [activeTab, getBlockedUsers]);

  const savePrivacySettings = async (key, value) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    try {
      await updateProfile({ privacy: updated });
    } catch {
      setPrivacySettings(privacySettings);
    }
  };

  const categories = [
    { id: 'appearance', label: 'Environment', icon: Palette },
    { id: 'privacy', label: 'Sovereign Shield', icon: Shield },
    { id: 'notifications', label: 'Signal Center', icon: Waves },
    { id: 'account', label: 'Identity & Danger', icon: Fingerprint },
  ];

  const themes = [
    { id: 'dark', label: 'Midnight Black', gradient: 'from-[#050816] to-[#0B1120]', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]', accent: 'bg-blue-500', border: 'border-blue-500/20', bgMock: 'bg-blue-500/10', ring: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
    { id: 'light', label: 'Dashboard White', gradient: 'from-[#F1F5F9] to-[#FFFFFF]', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]', accent: 'bg-blue-500', border: 'border-slate-200', bgMock: 'bg-slate-200', ring: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface-base text-text font-sans flex">
      <AmbientBackground activeTab={activeTab} />
      
      <div className="relative z-10 flex w-full max-w-[1400px] mx-auto h-full px-6 lg:px-12">
        
        {/* Floating Vertical Navigator */}
        <nav className="w-72 flex-shrink-0 pt-20 pb-12 flex flex-col hidden md:flex border-r border-default">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 text-text-muted hover:text-text transition-colors text-sm font-medium mb-16 w-fit group"
          >
            <div className="p-1.5 rounded-full bg-border group-hover:bg-border-hover transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Interface
          </button>

          <h2 className="text-3xl font-light tracking-tight text-text mb-10 pl-2">System<br/><span className="text-text-muted">Preferences</span></h2>

          <div className="relative space-y-1 flex-1 pr-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeTab === cat.id;
              const isDanger = cat.id === 'account';
              
              return (
                <button
                  key={cat.id}
                  onClick={() => handleTabChange(cat.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? (isDanger ? 'text-rose' : 'text-text')
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {/* Glass indicator background */}
                  {isSelected && (
                    <div className={`absolute inset-0 border shadow-spatial backdrop-blur-md rounded-2xl transition-colors duration-500 ${
                      isDanger ? 'bg-rose/5 border-rose/10' : 'bg-border/50 border-border-hover'
                    }`} />
                  )}
                  
                  <Icon className={`relative z-10 transition-colors ${
                    isSelected ? (isDanger ? 'text-rose' : 'text-accent') : 'group-hover:text-text'
                  }`} size={18} strokeWidth={isSelected ? 2 : 1.5} />
                  
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Dynamic Cinematic Canvas */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar pt-20 pb-32 md:pl-16 relative">
          <div className="max-w-3xl animate-slide-up">
            
            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-16">
                <div>
                  <h1 className="text-4xl font-light tracking-tight mb-3">Environment</h1>
                  <p className="text-text-muted text-sm max-w-lg leading-relaxed">
                    Shape the visual atmosphere of your digital space. These parameters alter the depth, lighting, and materiality of the entire operating system.
                  </p>
                </div>

                <section className="space-y-6">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest pl-1">Cinematic Lighting Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`group relative flex flex-col p-4 rounded-[24px] text-left transition-all duration-500 overflow-hidden ${
                          theme === t.id
                            ? `border-border-active ${t.glow} bg-border/20`
                            : 'border-default hover:border-border-hover bg-transparent hover:bg-border/10'
                        } border`}
                      >
                        {/* Simulated UI Glass Card */}
                        <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${t.gradient} border ${t.border} mb-4 p-3 flex flex-col gap-3 relative overflow-hidden shadow-sm`}>
                          <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent to-white mix-blend-[var(--ambient-overlay)] transition-opacity ${theme === t.id ? 'opacity-30' : ''}`} />
                          {/* Mock UI Elements */}
                          <div className="flex gap-2 relative z-10">
                            <div className={`w-6 h-6 rounded-full ${t.bgMock}`} />
                            <div className={`flex-1 h-6 rounded-lg ${t.bgMock}`} />
                          </div>
                          <div className={`flex-1 w-full rounded-lg ${t.bgMock} border ${t.border} relative overflow-hidden z-10`}>
                            <div className={`absolute bottom-2 right-2 w-1/2 h-6 rounded-md ${t.accent} opacity-80 backdrop-blur-md`} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-1">
                          <div className={`w-2 h-2 rounded-full ${t.accent} ${theme === t.id ? t.ring : ''}`} />
                          <span className={`text-sm font-medium transition-colors ${theme === t.id ? 'text-text' : 'text-text-secondary'}`}>{t.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-8">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest pl-1">Spatial Parameters</h3>
                  
                  <div className="p-8 rounded-[32px] bg-border/10 border border-default space-y-10 shadow-spatial-sm backdrop-blur-xl">
                    <Slider
                      label="Interface Scale"
                      value={fontSize}
                      min={12} max={18}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      unit="px"
                      description="Adjusts the foundational typographic scale. Larger values increase the physical presence of text."
                    />
                    
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-text-secondary tracking-wide block">Layout Density</label>
                      <div className="flex p-1 bg-surface/50 rounded-2xl border border-default w-fit">
                        {['cozy', 'compact'].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDensity(d)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              density === d
                                ? 'bg-border-active text-text shadow-sm'
                                : 'text-text-muted hover:text-text'
                            }`}
                          >
                            {d === 'cozy' ? 'Spacious / Calm' : 'Compact / Dense'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-text-secondary tracking-wide block">Interface Sharpness</label>
                      <div className="flex p-1 bg-surface/50 rounded-2xl border border-default w-fit">
                        {['sharp', 'smooth', 'round'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setUiSharpness(s)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                              uiSharpness === s
                                ? 'bg-border-active text-text shadow-sm'
                                : 'text-text-muted hover:text-text'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Slider
                      label="Glass Material Transparency"
                      value={glassTransparency}
                      min={0.1} max={0.8} step={0.05}
                      onChange={(e) => setGlassTransparency(parseFloat(e.target.value))}
                      description="Determines how much of the atmospheric background leaks through the application surfaces."
                    />

                    <Slider
                      label="Motion & Physics Intensity"
                      value={motionIntensity}
                      min={0} max={1.5} step={0.1}
                      onChange={(e) => setMotionIntensity(parseFloat(e.target.value))}
                      description="Scales the spring physics, blur transitions, and hover magnetism across the OS."
                    />
                  </div>
                </section>
              </div>
            )}

            {/* TAB: PRIVACY */}
            {activeTab === 'privacy' && (
              <div className="space-y-16">
                <div>
                  <h1 className="text-4xl font-light tracking-tight mb-3">Sovereign Shield</h1>
                  <p className="text-text-muted text-sm max-w-lg leading-relaxed">
                    Total control over your cryptographic presence. Determine who can intercept your frequencies and view your orbital status.
                  </p>
                </div>

                <div className="w-full h-48 rounded-[32px] border border-default bg-gradient-to-b from-border/20 to-transparent relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] mix-blend-[var(--ambient-overlay)]" />
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-[50px] rounded-full mix-blend-[var(--ambient-overlay)] animate-pulse" />
                    <Shield className="w-16 h-16 text-accent relative z-10" strokeWidth={1} />
                    {/* Concentric rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-accent/20 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-accent/10 rounded-full" />
                  </div>
                </div>

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest pl-1 mb-6">Radar & Presence</h3>
                  
                  <SettingRow 
                    icon={Activity} 
                    title="Live Orbit Status" 
                    description="Broadcast your active connection status to peers in the network."
                  >
                    <Toggle checked={privacySettings.showOnlineStatus} onChange={(val) => savePrivacySettings('showOnlineStatus', val)} />
                  </SettingRow>

                  <SettingRow 
                    icon={Check} 
                    title="Cryptographic Read Receipts" 
                    description="Transmit a signal when you decrypt and view incoming messages."
                  >
                    <Toggle checked={privacySettings.readReceipts} onChange={(val) => savePrivacySettings('readReceipts', val)} />
                  </SettingRow>

                  <SettingRow 
                    icon={Eye} 
                    title="Profile Visibility Envelope" 
                    description="Determine the boundary of your public identity exposure."
                  >
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => savePrivacySettings('profileVisibility', e.target.value)}
                      className="px-4 py-2.5 bg-surface text-text rounded-xl border border-default text-sm outline-none cursor-pointer hover:bg-surface-elevated transition-colors focus:border-accent"
                    >
                      <option value="public">Global Open (Public)</option>
                      <option value="friends">Trusted Nodes (Friends)</option>
                      <option value="private">Sealed (Private)</option>
                    </select>
                  </SettingRow>

                  <SettingRow 
                    icon={Lock} 
                    title="Incoming Frequency Firewall" 
                    description="Restrict who can initiate direct cryptographic handshakes with you."
                  >
                    <select
                      value={privacySettings.allowDMsFrom}
                      onChange={(e) => savePrivacySettings('allowDMsFrom', e.target.value)}
                      className="px-4 py-2.5 bg-surface text-text rounded-xl border border-default text-sm outline-none cursor-pointer hover:bg-surface-elevated transition-colors focus:border-accent"
                    >
                      <option value="everyone">Open Port (Everyone)</option>
                      <option value="friends">Verified Only (Friends)</option>
                      <option value="nobody">Total Lockdown</option>
                    </select>
                  </SettingRow>
                </section>

                <section className="space-y-6 pt-8">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest pl-1">Quarantined Frequencies</h3>
                  <div className="p-6 rounded-[24px] bg-border/10 border border-default shadow-inner-light">
                    {blockedUsers.length > 0 ? (
                      <div className="divide-y divide-border">
                        {blockedUsers.map((user) => (
                          <div key={user._id} className="flex items-center justify-between py-3">
                            <span className="text-sm text-text font-medium">{user.fullName}</span>
                            <Button variant="ghost" size="xs" onClick={() => unblockUser(user._id)} className="text-rose hover:bg-rose/10 hover:text-rose border border-transparent hover:border-rose/20 rounded-lg">
                              Restore Access
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mx-auto mb-3">
                          <Zap className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm text-text-secondary">No quarantined nodes. The network is clear.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-16">
                <div>
                  <h1 className="text-4xl font-light tracking-tight mb-3">Signal Center</h1>
                  <p className="text-text-muted text-sm max-w-lg leading-relaxed">
                    Tune how the system alerts you to environmental shifts and incoming data streams.
                  </p>
                </div>

                <div className="w-full h-40 rounded-[32px] border border-default bg-gradient-to-b from-border/20 to-transparent relative overflow-hidden flex items-center justify-center">
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="w-1.5 rounded-full bg-accent/40 animate-pulse"
                        style={{ 
                          height: `${Math.random() * 40 + 10}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '1s'
                        }}
                      />
                    ))}
                    <Volume2 className="w-8 h-8 text-accent ml-4 opacity-80" strokeWidth={1.5} />
                  </div>
                </div>

                <section className="space-y-2">
                  <SettingRow 
                    icon={Volume2} 
                    title="Acoustic Pulses" 
                    description="Emit soft, physical-feeling audio cues for incoming messages and system events."
                  >
                    <Toggle checked={notificationSettings.sounds} onChange={(val) => setNotificationSettings({ ...notificationSettings, sounds: val })} />
                  </SettingRow>

                  <SettingRow 
                    icon={Bell} 
                    title="Visual Desktop Signals" 
                    description="Display floating spatial cards outside the main interface frame."
                  >
                    <Toggle checked={notificationSettings.desktopAlerts} onChange={(val) => setNotificationSettings({ ...notificationSettings, desktopAlerts: val })} />
                  </SettingRow>
                </section>
              </div>
            )}

            {/* TAB: ACCOUNT / DANGER */}
            {activeTab === 'account' && (
              <div className="space-y-16 animate-fade-in">
                <div>
                  <h1 className="text-4xl font-light tracking-tight mb-3 text-rose-500">Identity & Protocol</h1>
                  <p className="text-rose-500/70 text-sm max-w-lg leading-relaxed">
                    High-Security Sovereign Control Chamber. Actions taken here alter the fundamental existence of your node in the network.
                  </p>
                </div>

                {/* Identity Block */}
                <div className="p-8 rounded-[32px] bg-border/20 border border-default shadow-inner-light flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-spatial-700 to-spatial-800 border border-default flex items-center justify-center shadow-spatial">
                    <User className="w-8 h-8 text-text-secondary" strokeWidth={1} />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-text mb-1">{authUser?.fullName}</h2>
                    <p className="text-sm font-mono text-text-muted">{authUser?.email}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-border border border-border-hover">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Node Active</span>
                    </div>
                  </div>
                </div>

                {/* Danger Actions */}
                <section className="space-y-6">
                  <h3 className="text-xs font-semibold text-rose-500 uppercase tracking-widest pl-1">Destructive Protocols</h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full flex items-center justify-between p-6 rounded-[24px] bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 transition-all group shadow-inner-light"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                          <LogOut size={20} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <p className="text-base font-medium text-rose-600">Sever Session</p>
                          <p className="text-sm text-rose-500/60 mt-0.5">Disconnect your cryptographic keys from the current environment.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-rose-500/40 group-hover:text-rose-500 transition-colors" />
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center justify-between p-6 rounded-[24px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all group shadow-spatial"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-3 rounded-xl bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                          <Trash2 size={20} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <p className="text-base font-medium text-red-600 group-hover:text-red-700 transition-colors">Purge Node Existence</p>
                          <p className="text-sm text-red-500/70 mt-0.5">Permanently obliterate all data, messages, and network ties. Irreversible.</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-500/40 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </section>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Cinematic Modals */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowLogoutModal(false)}>
          <div className="p-8 rounded-[32px] bg-surface border border-default max-w-md w-full shadow-spatial animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-6 border border-border-hover">
              <LogOut className="w-5 h-5 text-text-secondary" />
            </div>
            <h3 className="text-xl font-medium mb-3 text-text">Sever Active Session?</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">Your encrypted session will be terminated and local keys wiped. You will need to re-authenticate to rejoin the network.</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-xl font-medium text-sm text-text-secondary hover:text-text hover:bg-border border border-transparent transition-all" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="flex-1 py-3.5 rounded-xl font-medium text-sm bg-text text-surface-base hover:opacity-90 shadow-spatial transition-all" onClick={() => { logout(); navigate('/login'); }}>Sever Session</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowDeleteModal(false)}>
          <div className="p-8 rounded-[32px] bg-surface-base border border-red-500/30 max-w-md w-full shadow-[0_0_100px_rgba(220,38,38,0.2)] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30 text-red-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-medium mb-3 text-red-500">Purge Node Permanently</h3>
            <p className="text-sm text-red-400/70 mb-8 leading-relaxed">This protocol is absolutely irreversible. Your cryptographic identity, connections, and all stored frequencies will be shattered into the void.</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-xl font-medium text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all" onClick={() => setShowDeleteModal(false)}>Abort Protocol</button>
              <button className="flex-1 py-3.5 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all" onClick={() => { setShowDeleteModal(false); toast.error('Node purge protocol engaged (Not implemented)'); }}>Execute Purge</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
