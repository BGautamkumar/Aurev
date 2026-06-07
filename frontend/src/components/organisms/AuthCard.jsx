import { cn } from '../../lib/utils';

const AuthCard = ({ children, className, title, subtitle, ...props }) => {
  return (
    <div
      className={cn(
        'relative w-full max-w-md mx-auto',
        'ads-surface-glass',
        'p-8 sm:p-10',
        'animate-scale-in',
        className
      )}
      {...props}
    >
      {/* Subtle gold glow behind card */}
      <div className="absolute -inset-px rounded-[17px] bg-gradient-to-b from-accent/10 to-transparent -z-10 blur-sm" />

      {/* Logo + Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-ads-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center shadow-glow-accent">
                <span className="text-lg font-black text-surface tracking-tight">AU</span>
              </div>
              <div className="absolute -inset-3 rounded-full bg-accent/10 blur-xl animate-glow-breathe -z-10" />
            </div>
          </div>

          {title && (
            <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="text-text-secondary text-base">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
