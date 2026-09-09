import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export const Dropdown = ({ trigger, children, align = 'right', width = 'w-48', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 origin-top bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0',
            width,
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, icon: Icon, danger = false, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};
