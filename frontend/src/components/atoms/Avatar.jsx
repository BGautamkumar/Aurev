import { cn } from '../../lib/utils';

const sizeMap = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm',
  xl: 'w-20 h-20 text-lg',
};

const onlineDotSizeMap = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

const gradients = [
  'from-border-mid to-elevated',
  'from-tier-signal to-elevated',
  'from-tier-initiate to-tier-signal',
  'from-surface to-elevated',
  'from-tier-pulse to-border-mid',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getGradient = (name) => {
  const index = (name || '').charCodeAt(0) % gradients.length;
  return gradients[index];
};

const tierRingColors = {
  bronze:   'ring-tier-initiate',
  silver:   'ring-tier-signal',
  gold:     'ring-tier-pulse',
  diamond:  'ring-tier-orbit',
  legend:   'ring-tier-nova',
  initiate: 'ring-tier-initiate',
  signal:   'ring-tier-signal',
  pulse:    'ring-tier-pulse',
  orbit:    'ring-tier-orbit',
  nova:     'ring-tier-nova',
};

const Avatar = ({
  src,
  name,
  size = 'md',
  online,
  showOnlineIndicator = true,
  aurevTier,
  className,
  ...props
}) => {
  const hasImage = src && !src.includes('avatar.png');

  return (
    <div className={cn('relative flex-shrink-0', className)} {...props}>
      <div
        className={cn(
          sizeMap[size],
          'rounded-full overflow-hidden',
          aurevTier
            ? `ring-2 ${tierRingColors[aurevTier] || 'ring-border'}`
            : online
              ? 'ring-2 ring-online/60'
              : 'ring-1 ring-border'
        )}
      >
        {hasImage ? (
          <img
            src={src}
            alt={name || 'User'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={cn(
            'w-full h-full bg-gradient-to-br flex items-center justify-center font-bold text-void',
            getGradient(name)
          )}>
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Online indicator with pulse */}
      {showOnlineIndicator && online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full',
            onlineDotSizeMap[size],
          )}
          style={{
            background: 'var(--online)',
            borderColor: 'var(--base)',
            boxShadow: '0 0 6px var(--online)',
            animation: 'pulse-ring 2s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
