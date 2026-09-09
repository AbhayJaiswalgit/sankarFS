import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CheckSquare, Users, BarChart2, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-72 max-w-[calc(100%-3rem)] bg-indigo-950 text-indigo-100 h-full flex flex-col animate-slide-right shadow-2xl">
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl leading-none">N</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">NOVA</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-900 rounded-lg text-indigo-300 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User profile brief */}
        <div className="p-4 border-b border-indigo-900/50 flex items-center gap-3">
          <Avatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group',
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-900/50 hover:text-white'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300')} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-indigo-900/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group w-full text-left hover:bg-indigo-900/50 hover:text-white"
          >
            <LogOut className="w-5 h-5 shrink-0 text-indigo-400 group-hover:text-red-400" />
            <span className="font-medium text-indigo-200 group-hover:text-white">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
