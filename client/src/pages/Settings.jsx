import { useState } from 'react';
import { User, Lock, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/api/services';
import { Card, CardBody } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) return;
    
    setProfileLoading(true);
    try {
      const { data } = await userService.updateProfile(profileData);
      updateUser(data.data.user);
      success('Profile updated successfully');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return error('New passwords do not match');
    }
    
    setPasswordLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardBody className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Information</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <Avatar user={user} size="xl" />
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Profile Photo</h3>
                    <p className="text-xs text-slate-500 max-w-sm mb-3">
                      We automatically generate an avatar based on your name. You can also provide an image URL.
                    </p>
                    <Input 
                      placeholder="https://example.com/avatar.jpg" 
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                    />
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5 border-t border-slate-100 pt-6">
                  <div className="grid md:grid-cols-2 gap-5">
                    <Input 
                      label="Full Name" 
                      required 
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                    <Input 
                      label="Email Address" 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      hint="Email cannot be changed."
                    />
                  </div>
                  <Textarea 
                    label="Bio" 
                    placeholder="Tell us a bit about yourself..." 
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    hint="Brief description for your profile (max 200 characters)."
                    maxLength={200}
                  />
                  
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" loading={profileLoading}>Save Changes</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardBody className="p-6 md:p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    required 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                  <div className="border-b border-slate-100 my-4" />
                  <Input 
                    label="New Password" 
                    type="password" 
                    required 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    required 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                  
                  <div className="pt-4">
                    <Button type="submit" loading={passwordLoading}>Update Password</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card>
              <CardBody className="p-6 md:p-8 text-center py-16">
                <SettingsIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Preferences</h2>
                <p className="text-slate-500">Theme and notification preferences coming soon.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
