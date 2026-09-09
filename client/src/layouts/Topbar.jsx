import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/api/services';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { formatRelative } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationService.getNotifications({ unreadOnly: true, limit: 5 }),
    refetchInterval: 30000, // poll every 30s
  });

  const unreadCount = notifData?.data?.unreadCount || 0;
  const notifications = notifData?.data?.notifications || [];

  const markAsRead = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead.mutate(notif._id);
    if (notif.relatedProject) {
      navigate(`/projects/${notif.relatedProject._id}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search (dummy UI for now, implemented fully in a dedicated component if needed) */}
        <div className="hidden md:flex relative group w-64 lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full h-9 pl-9 pr-4 text-sm bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Notifications Dropdown */}
        <Dropdown
          width="w-80"
          trigger={
            <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-500 animate-pulse-ring" />
              )}
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3"
                >
                  <Avatar user={notif.actor} size="sm" className="mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-800 font-medium line-clamp-2 leading-tight mb-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500">{formatRelative(notif.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center rounded-b-xl">
            <Link to="/settings" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              View all activity
            </Link>
          </div>
        </Dropdown>

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
              <Avatar user={user} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-slate-700">{user?.name?.split(' ')[0]}</span>
            </div>
          }
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <div className="p-1">
            <DropdownItem onClick={() => navigate('/settings')} icon={User}>Profile</DropdownItem>
            <DropdownItem onClick={() => navigate('/settings')} icon={Settings}>Settings</DropdownItem>
          </div>
          <div className="p-1 border-t border-slate-100">
            <DropdownItem onClick={handleLogout} icon={LogOut} danger>Logout</DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
