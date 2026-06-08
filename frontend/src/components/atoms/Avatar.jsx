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
  'from-primary to-primary-hover',
  'from-accent to-accent-hover',
  'from-spatial-600 to-spatial-700',
  'from-indigo-500 to-purple-600',
  'from-rose-500 to-pink-600',
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

  const tierRingColors = {
    bronze:  'ring-amber-700',
    silver:  'ring-gray-400',
    gold:    'ring-primary',
    diamond: 'ring-accent',
    legend:  'ring-primary-hover',
  };

  return (
    <div className={cn('relative flex-shrink-0', className)} {...props}>
      <div
        className={cn(
          sizeMap[size],
          'rounded-full overflow-hidden',
          aurevTier
            ? `ring-2 ${tierRingColors[aurevTier] || 'ring-border'}`
            : online
              ? 'ring-2 ring-emerald/40'
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
            'w-full h-full bg-gradient-to-br flex items-center justify-center font-bold text-surface-base',
            getGradient(name)
          )}>
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Online indicator */}
      {showOnlineIndicator && online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 bg-emerald rounded-full border-spatial-900',
            onlineDotSizeMap[size],
            'animate-pulse-online'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
