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
        'animate-in duration-500 fade-in slide-in-from-bottom-1',
        className,
      )}
    >
      {children}
    </div>
  );
};
