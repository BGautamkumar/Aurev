import { forwardRef, useId, useState } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, Lock, Mail, User, Search, AlertCircle } from 'lucide-react';

const iconMap = {
  email:    Mail,
  password: Lock,
  user:     User,
  search:   Search,
};

const Input = forwardRef(({
  className,
  type = 'text',
  label,
  placeholder,
  error,
  success,
  icon,
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : null;

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-2 transition-colors duration-fast"
          style={{
            color: error ? 'var(--danger)' : success ? 'var(--success)' : 'var(--text-secondary)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
        </label>
      )}

      <div className="relative">
        {(IconComponent || (icon && typeof icon !== 'string')) && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-fast"
            style={{
              color: error ? 'var(--danger)' : success ? 'var(--success)' : focused ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {IconComponent ? <IconComponent className="w-[18px] h-[18px]" /> : icon}
          </div>
        )}

        <input
          id={id}
          ref={ref}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={cn(
            'w-full px-4 py-3 text-base rounded-xl transition-all duration-fast',
            (IconComponent || icon) && 'pl-12',
            showPasswordToggle && 'pr-12',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            background: 'var(--elevated)',
            border: error
              ? '1px solid rgba(239,68,68,0.4)'
              : focused
                ? '1px solid var(--border-lit)'
                : '1px solid var(--border)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: focused
              ? 'inset 3px 0 0 var(--accent-base), 0 0 0 2px var(--accent-subtle)'
              : error
                ? '0 0 0 2px rgba(239,68,68,0.1)'
                : 'var(--shadow-inner-light)',
            fontFamily: 'Inter, sans-serif',
          }}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-fast"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs animate-slide-up" style={{ color: 'var(--danger)' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 mt-2 text-xs animate-slide-up" style={{ color: 'var(--success)' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
