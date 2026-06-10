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
        className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-fast"
        style={{
          background: checked ? 'var(--accent-base)' : 'transparent',
          border: checked ? '2px solid var(--accent-base)' : '2px solid var(--border-lit)',
          boxShadow: checked ? '0 0 8px var(--accent-subtle)' : 'none',
        }}
      >
        {checked && <Check className="w-3 h-3" strokeWidth={3} style={{ color: 'var(--void)' }} />}
      </button>
      {label && (
        <span className="text-sm select-none" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      )}
    </label>
  );
};

export default Checkbox;
