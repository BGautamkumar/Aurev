import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-accent text-void border border-accent-hover shadow-accent-glow hover:bg-accent-hover hover:shadow-accent-glow-lg active:scale-[0.96] font-bold',
  secondary: 'bg-elevated text-text border border-border hover:bg-overlay hover:border-border-lit active:scale-[0.96] shadow-spatial-sm',
  ghost:     'bg-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text active:scale-[0.96]',
  danger:    'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 active:scale-[0.96]',
  outline:   'bg-transparent border border-border text-text hover:bg-white/[0.04] hover:border-border-lit active:scale-[0.96]',
  accent:    'bg-accent text-void border border-accent-hover font-bold hover:bg-accent-hover active:scale-[0.96] transition-all shadow-accent-glow hover:shadow-accent-glow-lg',
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
  const safeVariant = variants[variant] ? variant : 'primary';

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium cursor-pointer select-none',
        'transition-all duration-fast ease-spring',
        variants[safeVariant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'cursor-wait pointer-events-none opacity-80',
        disabled && 'opacity-40 cursor-not-allowed transform-none hover:shadow-none hover:border-border',
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
