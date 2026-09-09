import { cn } from '@/utils/cn';

export const ProgressBar = ({ progress = 0, className, height = 'h-2', showLabel = false }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={cn('progress-bar-track', height)}>
        <div
          className="progress-bar-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
