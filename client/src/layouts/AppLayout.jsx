import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';
import { cn } from '@/utils/cn';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex font-sans text-slate-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          collapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden">
          <div className="page-enter h-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
