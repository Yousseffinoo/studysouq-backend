import { useState } from 'react';
import { Save, User, Lock, Bell, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../admin/AdminLayout';
import { useAuth } from '../../../contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [appSettings, setAppSettings] = useState({
    appName: 'Educational Web',
    appDescription: 'Learn Mathematics Online',
    supportEmail: 'support@educationalweb.com',
    maintenanceMode: false,
    allowSignups: true,
    emailVerificationRequired: true
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    toast.success('Password updated successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleAppSettingsUpdate = (e) => {
    e.preventDefault();
    toast.success('App settings updated successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'app', label: 'App Settings', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Settings</h1>
          <p className="text-sm text-gray-600">Manage your account and application settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-[#0B1D34] border border-white/10 rounded-xl p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeTab === tab.id
                        ? 'bg-[#2F6FED] text-white font-medium shadow-lg'
                        : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-[#0B1D34] border border-white/10 rounded-xl p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Role</label>
                      <input
                        type="text"
                        value={user?.role || 'admin'}
                        disabled
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[#94A3B8] opacity-60"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#2F6FED] hover:bg-[#2F6FED]/80 text-white rounded-lg transition-colors font-medium"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div className="p-4 bg-[#2F6FED]/10 border border-[#2F6FED]/30 rounded-lg">
                      <p className="text-sm text-[#A9C7FF]">
                        <strong>Password Requirements:</strong><br />
                        • At least 6 characters<br />
                        • Include uppercase and lowercase letters<br />
                        • Include at least one number
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#2F6FED] hover:bg-[#2F6FED]/80 text-white rounded-lg transition-colors font-medium"
                    >
                      <Lock className="w-5 h-5" />
                      Update Password
                    </button>
                  </form>
                </div>
              )}

              {/* App Settings Tab */}
              {activeTab === 'app' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Application Settings</h2>
                  <form onSubmit={handleAppSettingsUpdate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">App Name</label>
                      <input
                        type="text"
                        value={appSettings.appName}
                        onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">App Description</label>
                      <input
                        type="text"
                        value={appSettings.appDescription}
                        onChange={(e) => setAppSettings({ ...appSettings, appDescription: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">Support Email</label>
                      <input
                        type="email"
                        value={appSettings.supportEmail}
                        onChange={(e) => setAppSettings({ ...appSettings, supportEmail: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2F6FED] transition-all"
                      />
                    </div>

                    <div className="space-y-3 pt-4">
                      <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-white">Maintenance Mode</p>
                          <p className="text-xs text-[#94A3B8] mt-1">Disable user access temporarily</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={appSettings.maintenanceMode}
                          onChange={(e) => setAppSettings({ ...appSettings, maintenanceMode: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-white">Allow Signups</p>
                          <p className="text-xs text-[#94A3B8] mt-1">Enable new user registrations</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={appSettings.allowSignups}
                          onChange={(e) => setAppSettings({ ...appSettings, allowSignups: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                        <div>
                          <p className="text-sm font-medium text-white">Email Verification Required</p>
                          <p className="text-xs text-[#94A3B8] mt-1">Users must verify email before access</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={appSettings.emailVerificationRequired}
                          onChange={(e) => setAppSettings({ ...appSettings, emailVerificationRequired: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#2F6FED] hover:bg-[#2F6FED]/80 text-white rounded-lg transition-colors font-medium"
                    >
                      <Save className="w-5 h-5" />
                      Save Settings
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-white">New User Signups</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Get notified when users register</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-white">Content Uploads</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Get notified of new content submissions</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-white">System Alerts</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Get notified of system issues</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-white">Weekly Reports</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Receive weekly analytics reports</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    </label>
                  </div>

                  <button className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#2F6FED] hover:bg-[#2F6FED]/80 text-white rounded-lg transition-colors font-medium">
                    <Save className="w-5 h-5" />
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
