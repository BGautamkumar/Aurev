import { cn } from '../../lib/utils';

const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-accent' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald' };
    return { score: 5, label: 'Excellent', color: 'bg-accent' };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              level <= strength.score ? strength.color : 'bg-surface-300'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs transition-colors',
        strength.score <= 1 ? 'text-rose' :
        strength.score <= 2 ? 'text-amber' :
        strength.score <= 3 ? 'text-accent' :
        strength.score <= 4 ? 'text-emerald' : 'text-accent'
      )}>
        {strength.label}
      </p>
    </div>
  );
};

export default PasswordStrength;
