import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef(({ label, error, hint, icon: Icon, className, containerClass, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-9 px-3 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 hover:border-slate-300',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, hint, className, containerClass, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder-slate-400 resize-none',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500',
          'disabled:bg-slate-50 disabled:cursor-not-allowed',
          error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
          className
        )}
        rows={props.rows || 3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, children, className, containerClass, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full h-9 px-3 text-sm bg-white border rounded-lg text-slate-900',
          'transition-colors duration-150 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500',
          'disabled:bg-slate-50 disabled:cursor-not-allowed',
          error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
