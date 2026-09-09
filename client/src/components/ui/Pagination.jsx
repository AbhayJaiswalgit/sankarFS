import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Pagination = ({ page, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white', className)}>
      <div className="hidden sm:flex flex-1 text-sm text-slate-500">
        Page <span className="font-medium text-slate-900 mx-1">{page}</span> of <span className="font-medium text-slate-900 mx-1">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="sm:hidden text-sm font-medium">
          {page} / {totalPages}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
