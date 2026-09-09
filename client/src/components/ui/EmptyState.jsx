import { cn } from '@/utils/cn';

export const EmptyState = ({
  icon: Icon,
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  action,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
