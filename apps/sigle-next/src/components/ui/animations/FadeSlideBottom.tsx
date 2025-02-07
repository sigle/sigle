import { cn } from '@/lib/cn';

export const FadeSlideBottom = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={cn(
        'duration-500 animate-in fade-in slide-in-from-bottom-1',
        className,
      )}
    >
      {children}
    </div>
  );
};
