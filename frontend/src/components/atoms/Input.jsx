import { forwardRef, useId } from 'react';
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
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : null;

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium mb-2 transition-colors duration-300 ease-spatial',
            error ? 'text-rose' : success ? 'text-emerald' : 'text-text-secondary'
          )}
        >
          {label}
          {required && <span className="text-rose/80 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {(IconComponent || (icon && typeof icon !== 'string')) && (
          <div className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ease-spatial',
            error ? 'text-rose' : success ? 'text-emerald' : 'text-text-muted'
          )}>
            {IconComponent ? <IconComponent className="w-[18px] h-[18px]" /> : icon}
          </div>
        )}

        <input
          id={id}
          ref={ref}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 text-base rounded-xl bg-surface border border-default text-text transition-all duration-300 ease-spatial shadow-inner-light',
            'focus:bg-surface-elevated focus:border-border-active focus:ring-1 focus:ring-border-active focus:outline-none placeholder:text-text-muted',
            (IconComponent || icon) && 'pl-12',
            showPasswordToggle && 'pr-12',
            error && 'border-rose/40 focus:border-rose focus:ring-rose/30',
            success && 'border-emerald/40 focus:border-emerald focus:ring-emerald/30',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors duration-300 ease-spatial"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-rose text-xs animate-slide-up">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 mt-2 text-emerald text-xs animate-slide-up">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
