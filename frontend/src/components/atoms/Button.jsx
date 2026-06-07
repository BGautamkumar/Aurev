import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary text-surface-base border border-transparent shadow-spatial-sm hover:bg-primary-hover hover:shadow-spatial active:scale-[0.98]',
  secondary: 'bg-surface-100 text-text border border-default hover:bg-surface-200 hover:border-border-active active:scale-[0.98] shadow-spatial-sm',
  ghost:     'bg-transparent text-text-secondary hover:bg-border/40 hover:text-text active:scale-[0.98]',
  danger:    'bg-rose/10 text-rose border border-rose/20 hover:bg-rose/20 active:scale-[0.98]',
  outline:   'bg-transparent border border-default text-text hover:bg-border/30 hover:border-border-active active:scale-[0.98]',
  accent:    'bg-gradient-to-r from-accent to-accent-hover text-surface-base border border-transparent font-bold hover:from-accent-hover hover:to-accent active:scale-[0.98] transition-all shadow-glow-accent hover:shadow-glow-accent-lg',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
  sm: 'px-3.5 py-2 text-sm gap-1.5 rounded-xl',
  md: 'px-5 py-2.5 text-base gap-2 rounded-xl',
  lg: 'px-6 py-3 text-lg gap-2.5 rounded-2xl',
  icon: 'p-2.5 rounded-xl',
};

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  children,
  fullWidth = false,
  ...props
}, ref) => {
  // Graceful fallback for old gold variant
  const safeVariant = variants[variant] ? variant : 'primary';

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300 ease-spatial cursor-pointer select-none',
        variants[safeVariant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait pointer-events-none opacity-80',
        disabled && 'opacity-50 cursor-not-allowed transform-none hover:shadow-none hover:border-default',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
