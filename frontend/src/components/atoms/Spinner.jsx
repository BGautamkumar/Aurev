import { cn } from '../../lib/utils';

const Spinner = ({ size = 'md', className, gold = true }) => {
  const sizes = {
    xs: 'w-3.5 h-3.5 border-[1.5px]',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[2.5px]',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-[3.5px]',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizes[size],
        gold
          ? 'border-accent/20 border-t-accent'
          : 'border-text-muted/20 border-t-text-secondary',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
