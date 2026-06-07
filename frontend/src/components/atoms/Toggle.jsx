import { cn } from '../../lib/utils';

const Toggle = ({ checked, onChange, disabled = false, size = 'md', label, className }) => {
  const sizes = {
    sm: { track: 'w-8 h-[18px]', dot: 'w-3.5 h-3.5', translate: 'translate-x-[14px]' },
    md: { track: 'w-10 h-[22px]', dot: 'w-4.5 h-4.5', translate: 'translate-x-[18px]' },
    lg: { track: 'w-12 h-[26px]', dot: 'w-5 h-5', translate: 'translate-x-[22px]' },
  };

  const s = sizes[size];

  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          s.track,
          checked ? 'bg-accent' : 'bg-surface-300'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-elevation-1 transform transition-transform duration-200 ml-[2px]',
            s.dot,
            checked ? s.translate : 'translate-x-0'
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-text-secondary select-none">{label}</span>
      )}
    </label>
  );
};

export default Toggle;
