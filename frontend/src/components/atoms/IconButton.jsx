import { cn } from '../../lib/utils';

const IconButton = ({ children, className, variant = 'ghost', size = 'md', active = false, badge, ...props }) => {
  const variants = {
    ghost:   'text-white-dim hover:text-text hover:bg-white/[0.04]',
    surface: 'bg-elevated border border-border hover:bg-overlay text-text-secondary hover:text-text shadow-spatial-sm',
    accent:  'bg-accent-subtle text-accent hover:bg-accent/20',
    danger:  'text-text-secondary hover:text-danger hover:bg-danger/10',
  };

  const sizes = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
  };

  const safeVariant = variants[variant] ? variant : 'ghost';

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center transition-all duration-fast ease-smooth cursor-pointer select-none active:scale-[0.92]',
        variants[safeVariant],
        sizes[size],
        active && 'bg-elevated text-accent shadow-spatial-sm border border-border-active',
        className
      )}
      {...props}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1"
          style={{
            background: 'var(--accent-base)',
            color: 'var(--white-pure)',
            boxShadow: '0 2px 8px var(--accent-subtle)',
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};

export default IconButton;
