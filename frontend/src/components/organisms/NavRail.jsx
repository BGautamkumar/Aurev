import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import {
  MessageSquare, Radio, Trophy, Bell,
  Sparkles, Settings, LogOut,
} from 'lucide-react';
import Avatar from '../atoms/Avatar';

/* ── AUREV Geometric Logo Mark ── */
const AurevMark = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer hexagonal frame */}
    <path
      d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
      stroke="var(--border-lit)"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Inner signal triangle */}
    <path
      d="M16 8L24 20H8L16 8Z"
      fill="var(--nav-logo-triangle)"
      opacity="0.9"
    />
    {/* Center dot */}
    <circle cx="16" cy="17" r="2" fill="var(--void)" />
  </svg>
);

const NavRail = () => {
  const { authUser } = useAuthStore();
  const { toggleCommandPalette } = useUIStore();
  const location = useLocation();

  if (!authUser) return null;

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/signup' ||
    location.pathname === '/login' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password');
  if (isPublicPage) return null;

  const navItems = [
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/rooms', icon: Radio, label: 'Stream Rooms' },
    { to: '/aurev-rank', icon: Trophy, label: 'AUREV Rank' },
  ];

  const utilItems = [
    { id: 'notifications', icon: Bell, label: 'Notifications', disabled: true },
    { id: 'command', icon: Sparkles, label: 'Command Palette ⌘K', onClick: toggleCommandPalette },
  ];

  const isActive = (path) => {
    if (path === '/messages') return location.pathname.startsWith('/messages');
    if (path === '/rooms') return location.pathname.startsWith('/rooms');
    return location.pathname === path;
  };

  const NavIcon = ({ to, icon: Icon, label, active, disabled, onClick }) => (
    <div className="relative group w-full flex justify-center">
      {to ? (
        <Link to={to} className="relative block">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-fast ease-smooth">
            {/* Active indicator — accent left bar */}
            {active && (
              <div
                className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full animate-slide-in-left"
                style={{ background: 'var(--accent-base)', boxShadow: '0 0 8px var(--accent-strong)' }}
              />
            )}
            {/* Glow behind active icon */}
            {active && (
              <div className="absolute inset-0 rounded-xl" style={{ background: 'var(--accent-subtle)', filter: 'blur(8px)' }} />
            )}
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-fast ease-smooth"
              style={{
                color: active ? 'var(--nav-icon-active)' : 'var(--nav-icon)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--nav-icon-hover)';
                  e.currentTarget.style.background = 'var(--nav-icon-hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--nav-icon)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon className="w-[20px] h-[20px]" strokeWidth={active ? 2.2 : 1.8} />
            </div>
          </div>
        </Link>
      ) : (
        <button
          onClick={onClick}
          disabled={disabled}
          className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-fast ease-smooth active:scale-[0.92]"
          style={{
            color: disabled ? 'var(--nav-icon-disabled)' : 'var(--nav-icon)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.color = 'var(--nav-icon-hover)';
              e.currentTarget.style.background = 'var(--nav-icon-hover-bg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.color = 'var(--nav-icon)';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Icon className="w-[20px] h-[20px]" strokeWidth={1.8} />
        </button>
      )}
      {/* Tooltip */}
      <div className="absolute left-[62px] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-fast z-[100]">
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
          style={{
            background: 'var(--overlay)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-spatial-sm)',
            animation: 'tooltip-slide-in 0.14s var(--smooth) both',
          }}
        >
          {label}
          {disabled && <span className="text-text-muted ml-1.5">Soon</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Nav Rail ── */}
      <aside
        className="hidden md:flex h-screen w-[72px] flex-col items-center justify-between py-5 select-none shrink-0 z-50"
        style={{
          background: 'var(--void)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="group mb-2" title="AUREV">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-normal hover:bg-white/[0.04] active:scale-[0.92]">
            <AurevMark />
          </div>
        </Link>

        {/* Main Navigation */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full">
          {navItems.map((item) => (
            <NavIcon key={item.to} {...item} active={isActive(item.to)} />
          ))}

          <div className="w-6 h-px my-2" style={{ background: 'var(--border)' }} />

          {utilItems.map((item) => (
            <NavIcon key={item.id} {...item} />
          ))}
        </div>

        {/* Bottom: Settings, Logout, Avatar */}
        <div className="flex flex-col items-center gap-2 w-full">
          <NavIcon to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />

          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-fast ease-smooth active:scale-[0.92] hover:bg-danger/[0.08]"
              style={{ color: 'var(--nav-icon)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--nav-icon)'; }}
            >
              <LogOut className="w-[20px] h-[20px]" strokeWidth={1.8} />
            </button>
            <div className="absolute left-[62px] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-fast z-[100]">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{
                  background: 'var(--overlay)',
                  border: '1px solid var(--border)',
                  color: 'var(--danger)',
                  boxShadow: 'var(--shadow-spatial-sm)',
                }}
              >
                Sign Out
              </div>
            </div>
          </div>

          <div className="w-6 h-px my-1" style={{ background: 'var(--border)' }} />

          {/* User Avatar */}
          <Link to="/me" className="relative group hover:opacity-90 active:scale-[0.92] transition-all">
            <div className="relative">
              <Avatar
                src={authUser.profilePic}
                name={authUser.fullName}
                size="sm"
                online={true}
              />
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around z-50 md:hidden select-none pb-safe pt-2"
        style={{
          background: 'var(--glass-background)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid var(--border)',
          minHeight: '4rem',
        }}
      >
        {[...navItems, { to: '/settings', icon: Settings, label: 'Settings' }].map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center p-2 relative">
              {/* Active top bar */}
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                  style={{ background: 'var(--accent-base)', boxShadow: '0 0 6px var(--accent-strong)' }}
                />
              )}
              <div
                className="p-2 rounded-xl transition-all duration-fast ease-smooth active:scale-[0.92]"
                style={{
                  color: active ? 'var(--nav-icon-active)' : 'var(--nav-icon)',
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default NavRail;
