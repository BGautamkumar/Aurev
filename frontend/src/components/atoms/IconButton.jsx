import { cn } from '../../lib/utils';

const IconButton = ({ children, className, variant = 'ghost', size = 'md', active = false, badge, ...props }) => {
  const variants = {
    ghost:   'hover:bg-surface text-text-secondary hover:text-text border border-transparent',
    surface: 'bg-surface border border-default hover:bg-surface-elevated text-text-secondary hover:text-text shadow-spatial-sm',
    accent:  'bg-accent/10 text-accent hover:bg-accent/20 border border-transparent',
    danger:  'text-text-secondary hover:text-rose hover:bg-rose/10 border border-transparent',
  };

  const sizes = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
  };

  const safeVariant = variants[variant] ? variant : 'ghost';

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center transition-all duration-300 ease-spatial cursor-pointer select-none active:scale-95',
        variants[safeVariant],
        sizes[size],
        active && 'bg-surface-elevated text-primary shadow-spatial-sm border-border-active',
        className
      )}
      {...props}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-rose text-white rounded-full px-1 shadow-[0_2px_8px_rgba(244,63,94,0.4)]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};

export default IconButton;
