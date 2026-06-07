import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageSquare, Radio, Trophy, Settings, LogOut } from 'lucide-react';
import Avatar from '../atoms/Avatar';

const NavRail = () => {
  const { authUser } = useAuthStore();
  const location = useLocation();

  if (!authUser) return null;

  const isPublicPage = location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/login';
  if (isPublicPage) return null;

  const navItems = [
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/rooms', icon: Radio, label: 'Stream Rooms' },
    { to: '/echo-rank', icon: Trophy, label: 'Echo Rank' },
  ];

  const isActive = (path) => {
    if (path === '/messages') return location.pathname.startsWith('/messages');
    if (path === '/rooms') return location.pathname.startsWith('/rooms');
    return location.pathname === path;
  };

  return (
    <>
      <aside className="h-[calc(100vh-32px)] w-[68px] my-4 ml-4 flex flex-col items-center justify-between py-5 select-none shrink-0 hidden md:flex z-50 spatial-surface">
        
        {/* Top AU Logo */}
        <Link to="/" className="relative group">
          <div className="w-10 h-10 rounded-xl bg-surface border border-default flex items-center justify-center hover:bg-surface-elevated hover:border-border-active transition-all duration-300 ease-spatial shadow-spatial-sm active:scale-[0.92]">
            <span className="text-xs font-semibold text-primary tracking-tight">AU</span>
          </div>
        </Link>

        {/* Center Navigation Icons */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
          {navItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;

            return (
              <div key={item.to} className="relative group w-full flex justify-center">
                <Link to={item.to} className="relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-spatial active:scale-[0.92] ${
                    active ? 'bg-surface-elevated text-primary shadow-spatial-sm border border-border-active scale-105 active:scale-[0.98]' : 'text-text-muted hover:text-text hover:bg-surface border border-transparent'
                  }`}>
                    <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  </div>
                </Link>
                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-surface border border-default text-xs font-medium text-text px-3 py-1.5 rounded-lg shadow-spatial pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Options & Avatar */}
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="relative group w-full flex justify-center">
            <Link to="/settings" className="relative">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-spatial active:scale-[0.92] ${
                isActive('/settings') ? 'bg-surface-elevated text-primary shadow-spatial-sm border border-border-active scale-105 active:scale-[0.98]' : 'text-text-muted hover:text-text hover:bg-surface border border-transparent'
              }`}>
                <Settings className="w-5 h-5" strokeWidth={isActive('/settings') ? 2.5 : 2} />
              </div>
            </Link>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-surface border border-default text-xs font-medium text-text px-3 py-1.5 rounded-lg shadow-spatial pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              System Preferences
            </div>
          </div>

          <div className="relative group w-full flex justify-center">
            <button onClick={() => useAuthStore.getState().logout()} className="relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ease-spatial text-text-muted hover:text-rose-500 hover:bg-rose-500/10 border border-transparent active:scale-[0.92]">
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </div>
            </button>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-surface border border-default text-xs font-medium text-rose-500 px-3 py-1.5 rounded-lg shadow-spatial pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Sever Session
            </div>
          </div>

          <div className="w-6 h-px bg-border my-1" />

          <Link to="/me" className="relative group hover:opacity-80 active:scale-[0.92] transition-all">
            <Avatar
              src={authUser.profilePic}
              name={authUser.fullName}
              size="sm"
              online={true}
            />
          </Link>
        </div>
      </aside>

      {/* Mobile Horizontal Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 min-h-[4rem] bg-surface/90 backdrop-blur-xl border-t border-default flex items-center justify-around z-50 md:hidden select-none pb-safe pt-2">
        {[...navItems, { to: '/settings', icon: Settings, label: 'Settings' }].map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center justify-center p-2">
              <div className={`p-2 rounded-xl transition-all duration-300 ease-spatial active:scale-[0.92] ${active ? 'bg-surface-elevated text-primary border border-border-active' : 'text-text-muted'}`}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default NavRail;
