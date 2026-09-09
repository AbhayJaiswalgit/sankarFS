import { cn } from '@/utils/cn';

export const Card = ({ children, className, hover = false }) => {
  return (
    <div className={cn('card', hover && 'card-hover', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={cn('px-5 py-4 border-b border-slate-100 flex items-center justify-between', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-base font-semibold text-slate-900', className)}>
    {children}
  </h3>
);

export const CardBody = ({ children, className, noPadding = false }) => (
  <div className={cn(!noPadding && 'p-5', className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }) => (
  <div className={cn('px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg', className)}>
    {children}
  </div>
);
