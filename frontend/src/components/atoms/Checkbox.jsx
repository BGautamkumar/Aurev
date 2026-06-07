import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

const Checkbox = ({ checked, onChange, disabled = false, label, className }) => {
  return (
    <label className={cn('inline-flex items-center gap-2.5 cursor-pointer group', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all duration-150',
          checked
            ? 'bg-accent border-accent'
            : 'bg-transparent border-surface-400 group-hover:border-text-muted'
        )}
      >
        {checked && <Check className="w-3 h-3 text-text-inverse" strokeWidth={3} />}
      </button>
      {label && (
        <span className="text-sm text-text-secondary select-none">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;
