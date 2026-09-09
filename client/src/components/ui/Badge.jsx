import { cn } from '@/utils/cn';
import { getStatusColor, getStatusLabel, getPriorityColor, getPriorityLabel } from '@/utils/helpers';

export const Badge = ({ children, className, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    primary: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger:  'bg-red-100 text-red-700 border-red-200',
    info:    'bg-sky-100 text-sky-700 border-sky-200',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
    getStatusColor(status)
  )}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {getStatusLabel(status)}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
    getPriorityColor(priority)
  )}>
    {getPriorityLabel(priority)}
  </span>
);
