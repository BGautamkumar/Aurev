import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-accent-subtle text-accent border border-accent/20',
  accent:  'bg-accent-subtle text-accent border border-accent/20',
  gold:    'bg-accent-subtle text-accent border border-accent/20',
  emerald: 'bg-success/10 text-success border border-success/20',
  rose:    'bg-danger/10 text-danger border border-danger/20',
  muted:   'bg-overlay text-text-muted border border-border',
  solid:   'bg-accent text-void border-none shadow-accent-glow-sm font-bold',
  tier:    'bg-white/5 text-white-soft border border-white/10',
};

const sizes = {
  xs: 'min-w-[16px] h-[16px] text-[9px] px-1.5',
  sm: 'min-w-[20px] h-[20px] text-[10px] px-2',
  md: 'min-w-[24px] h-[24px] text-xs px-2.5',
  lg: 'min-w-[28px] h-[28px] text-sm px-3',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
  className,
  ...props
}) => {
  const safeVariant = variants[variant] ? variant : 'primary';

  if (dot) {
    return (
      <span
        className={cn(
          'inline-block w-2 h-2 rounded-full',
          safeVariant === 'primary' && 'bg-accent shadow-[0_0_8px_var(--accent-strong)]',
          safeVariant === 'accent' && 'bg-accent shadow-[0_0_8px_var(--accent-strong)]',
          safeVariant === 'emerald' && 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]',
          safeVariant === 'rose' && 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]',
          safeVariant === 'muted' && 'bg-text-muted',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md leading-none tracking-wide',
        variants[safeVariant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
