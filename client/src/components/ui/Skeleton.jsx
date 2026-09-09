import { cn } from '@/utils/cn';

export const Skeleton = ({ className, circle = false }) => {
  return (
    <div
      className={cn(
        'skeleton',
        circle && 'rounded-full',
        className
      )}
    />
  );
};
