import { cn } from '../../lib/utils';

const variants = {
  gold:    'bg-accent/10 text-accent border border-accent/20',
  accent:  'bg-accent/10 text-accent border border-accent/20',
  cyan:    'bg-cyan/10 text-cyan border border-cyan/20',
  emerald: 'bg-emerald/10 text-emerald border border-emerald/20',
  rose:    'bg-rose/10 text-rose border border-rose/20',
  muted:   'bg-surface text-text-muted border border-default',
  solid:   'bg-primary text-surface-base border-none shadow-spatial-sm',
};

const sizes = {
  xs: 'min-w-[16px] h-[16px] text-[9px] px-1.5',
  sm: 'min-w-[20px] h-[20px] text-[10px] px-2',
  md: 'min-w-[24px] h-[24px] text-xs px-2.5',
  lg: 'min-w-[28px] h-[28px] text-sm px-3',
};

const Badge = ({
  children,
  variant = 'accent',
  size = 'sm',
  dot = false,
  className,
  ...props
}) => {
  const safeVariant = variants[variant] ? variant : 'accent';

  if (dot) {
    return (
      <span
        className={cn(
          'inline-block w-2 h-2 rounded-full',
          safeVariant === 'gold' && 'bg-accent shadow-[0_0_8px_rgba(245,197,24,0.4)]',
          safeVariant === 'accent' && 'bg-accent shadow-[0_0_8px_rgba(59,130,246,0.4)]',
          safeVariant === 'cyan' && 'bg-cyan shadow-[0_0_8px_rgba(34,211,238,0.4)]',
          safeVariant === 'emerald' && 'bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]',
          safeVariant === 'rose' && 'bg-rose shadow-[0_0_8px_rgba(244,63,94,0.4)]',
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
