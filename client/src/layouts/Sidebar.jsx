import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CheckSquare, Users, BarChart2, Settings, LogOut, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ collapsed, onToggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-indigo-950 text-indigo-100 transition-all duration-300 z-40 flex flex-col hidden md:flex',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-900/50">
        <div className={cn('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl leading-none">N</span>
          </div>
          {!collapsed && <span className="text-white font-bold text-xl tracking-tight">NOVA</span>}
        </div>
        {!collapsed && (
          <button onClick={onToggle} className="p-1 hover:bg-indigo-900 rounded-lg text-indigo-300 hover:text-white transition-colors">
            <PanelLeftClose className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {collapsed && (
          <button onClick={onToggle} className="p-2 mb-4 hover:bg-indigo-900 rounded-lg text-indigo-300 hover:text-white transition-colors mx-auto">
            <PanelRightClose className="w-5 h-5" />
          </button>
        )}
        
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                isActive ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-900/50 hover:text-white'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300')} />
              {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-indigo-900/50">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group w-full text-left hover:bg-indigo-900/50 hover:text-white',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0 text-indigo-400 group-hover:text-red-400" />
          {!collapsed && <span className="font-medium text-indigo-200 group-hover:text-white">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
