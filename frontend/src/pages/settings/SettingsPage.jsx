import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings.service';
import { apiKeysService } from '../../services/apiKeys.service';
import { stripeService } from '../../services/stripe.service';
import { useAuthStore } from '../../store/authStore';

const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('organization');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Organization Settings State
  const [orgSettings, setOrgSettings] = useState({
    industry: '',
    company_size: '',
    timezone: 'UTC',
    default_currency: 'USD',
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    customer_health_alerts: true,
    churn_risk_alerts: true,
    job_status_updates: true,
  });

  // Billing Info State
  const [billingInfo, setBillingInfo] = useState(null);

  // API Keys State
  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeyStats, setApiKeyStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    scopes: [],
    expires_in_days: null,
  });

  // Load data on mount and tab change
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    setSaveSuccess('');
    try {
      switch (tab) {
        case 'organization':
          const orgData = await settingsService.getOrganizationSettings();
          setOrgSettings(orgData);
          break;
        case 'profile':
          const profileData = await settingsService.getUserProfile();
          setUserProfile({
            full_name: profileData.full_name || '',
            email: profileData.email || '',
          });
          break;
        case 'api-keys':
          const [keysData, statsData] = await Promise.all([
            apiKeysService.getAllKeys(),
            apiKeysService.getStatistics()
          ]);
          setApiKeys(keysData);
          setApiKeyStats(statsData);
          break;
        case 'notifications':
          const notifData = await settingsService.getNotificationPreferences();
          setNotifications({
            customer_health_alerts: notifData.customer_health_alerts,
            churn_risk_alerts: notifData.churn_risk_alerts,
            job_status_updates: notifData.job_status_updates,
          });
          break;
        case 'billing':
          const subscription = await stripeService.getSubscription();
          setBillingInfo(subscription);
          break;
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save Organization Settings
  const saveOrganizationSettings = async () => {
    setLoading(true);
    setSaveSuccess('');
    try {
      await settingsService.updateOrganizationSettings(orgSettings);
      setSaveSuccess('Organization settings saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving organization settings:', error);
      alert('Failed to save organization settings');
    } finally {
      setLoading(false);
    }
  };

  // Save User Profile
  const saveUserProfile = async () => {
    setLoading(true);
    setSaveSuccess('');
    try {
      const updatedProfile = await settingsService.updateUserProfile({
        full_name: userProfile.full_name,
        email: userProfile.email,
      });
      
      // Update the auth store with new user data
      const updatedUser = {
        ...user,
        email: updatedProfile.email,
        user_metadata: {
          ...user.user_metadata,
          full_name: updatedProfile.full_name
        }
      };
      setUser(updatedUser);
      
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setSaveSuccess('');
    try {
      await settingsService.changePassword(passwordData.new_password);
      setSaveSuccess('Password changed successfully!');
      setPasswordData({ new_password: '', confirm_password: '' });
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Save Notification Preferences
  const saveNotificationPreferences = async () => {
    setLoading(true);
    setSaveSuccess('');
    try {
      await settingsService.updateNotificationPreferences(notifications);
      setSaveSuccess('Notification preferences saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  // API Keys Functions
  const handleCreateApiKey = async () => {
    if (!createForm.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }
    if (createForm.scopes.length === 0) {
      alert('Please select at least one scope');
      return;
    }

    try {
      const result = await apiKeysService.createKey(
        createForm.name,
        createForm.scopes,
        createForm.expires_in_days
      );
      setNewApiKey(result.key);
      setShowCreateModal(false);
      setShowSuccessModal(true);
      setCreateForm({ name: '', scopes: [], expires_in_days: null });
      await loadTabData('api-keys');
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    try {
      await apiKeysService.revokeKey(keyId);
      await loadTabData('api-keys');
      setSaveSuccess('API key revoked successfully');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error revoking key:', error);
      alert('Failed to revoke API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to permanently delete this API key?')) {
      return;
    }
    try {
      await apiKeysService.deleteKey(keyId);
      await loadTabData('api-keys');
      setSaveSuccess('API key deleted successfully');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete API key');
    }
  };

  const toggleScope = (scope) => {
    setCreateForm(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const tabs = [
    { id: 'organization', label: 'Organization', icon: '🏢' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'api-keys', label: 'API Keys', icon: '🔑' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ];

  const availableScopes = [
    { value: 'read:*', label: 'Read All' },
    { value: 'write:*', label: 'Write All' },
    { value: 'read:leads', label: 'Read Leads' },
    { value: 'write:leads', label: 'Write Leads' },
    { value: 'read:customers', label: 'Read Customers' },
    { value: 'write:customers', label: 'Write Customers' },
    { value: 'read:jobs', label: 'Read Jobs' },
    { value: 'write:jobs', label: 'Write Jobs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="w-full pb-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your organization and account preferences</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-t-xl border-b border-purple-500/20 animate-slide-in">
          <div className="flex space-x-1 p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg backdrop-blur-sm animate-fade-in">
            ✓ {saveSuccess}
          </div>
        )}

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-b-xl border border-purple-500/20 p-8 animate-fade-in min-h-[600px]">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-400">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'organization' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Organization Settings</h2>
                    <p className="text-gray-400">Manage your organization's basic information and preferences.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                      <select value={orgSettings.industry || ''} onChange={(e) => setOrgSettings({ ...orgSettings, industry: e.target.value })} className="w-full px-4 py-3 bg-gray-950 border-2 border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-500/50 cursor-pointer shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20">
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="education">Education</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
                      <select value={orgSettings.company_size || ''} onChange={(e) => setOrgSettings({ ...orgSettings, company_size: e.target.value })} className="w-full px-4 py-3 bg-gray-950 border-2 border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-500/50 cursor-pointer shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20">
                        <option value="">Select Company Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                      <select value={orgSettings.timezone} onChange={(e) => setOrgSettings({ ...orgSettings, timezone: e.target.value })} className="w-full px-4 py-3 bg-gray-950 border-2 border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-500/50 cursor-pointer shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Asia/Shanghai">Shanghai (CST)</option>
                        <option value="Australia/Sydney">Sydney (AEDT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Default Currency</label>
                      <select value={orgSettings.default_currency} onChange={(e) => setOrgSettings({ ...orgSettings, default_currency: e.target.value })} className="w-full px-4 py-3 bg-gray-950 border-2 border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-500/50 cursor-pointer shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="INR">INR - Indian Rupee</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-6">
                    <button onClick={saveOrganizationSettings} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium">
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">User Profile</h2>
                    <p className="text-gray-400">Manage your personal information and password.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input type="text" value={userProfile.full_name} onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input type="email" value={userProfile.email} onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter your email" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={saveUserProfile} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium">
                      {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                  </div>
                  <div className="border-t border-purple-500/20 pt-8 mt-8">
                    <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter new password (min 6 characters)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                        <input type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Confirm new password" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-6">
                      <button onClick={changePassword} disabled={loading || !passwordData.new_password} className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium">
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api-keys' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
                      <p className="text-gray-400">Manage API keys for external integrations and automations.</p>
                    </div>
                    <button 
                      onClick={() => {
                        console.log('Create button clicked');
                        setShowCreateModal(true);
                      }} 
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-medium"
                    >
                      + Create New Key
                    </button>
                  </div>
                  {apiKeyStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{apiKeyStats.total_keys}</div>
                        <div className="text-sm text-gray-400">Total Keys</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{apiKeyStats.active_keys}</div>
                        <div className="text-sm text-gray-400">Active</div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{apiKeyStats.inactive_keys}</div>
                        <div className="text-sm text-gray-400">Revoked</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{apiKeyStats.recently_used}</div>
                        <div className="text-sm text-gray-400">Recently Used</div>
                      </div>
                    </div>
                  )}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-purple-500/20">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Key</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Name</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Scopes</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Last Used</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-8 text-gray-400">No API keys yet. Create one to get started!</td></tr>
                        ) : (
                          apiKeys.map((key) => (
                            <tr key={key.id} className="border-b border-purple-500/10 hover:bg-gray-700/20">
                              <td className="py-3 px-4 font-mono text-sm text-gray-300">{key.key_prefix}••••</td>
                              <td className="py-3 px-4 text-white">{key.name}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {key.scopes.slice(0, 2).map((scope, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">{scope}</span>
                                  ))}
                                  {key.scopes.length > 2 && <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">+{key.scopes.length - 2}</span>}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-400 text-sm">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</td>
                              <td className="py-3 px-4">
                                {key.is_active ? (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Revoked</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {key.is_active && (
                                    <button onClick={() => handleRevokeKey(key.id)} className="px-3 py-1 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 rounded text-sm transition-colors">Revoke</button>
                                  )}
                                  <button onClick={() => handleDeleteKey(key.id)} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm transition-colors">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                    <p className="text-gray-400">Choose which notifications you want to receive.</p>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center justify-between p-6 bg-gray-700/30 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all">
                      <div>
                        <h3 className="font-medium text-white text-lg">Customer Health Alerts</h3>
                        <p className="text-sm text-gray-400 mt-1">Get notified about customer health score changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.customer_health_alerts} onChange={(e) => setNotifications({ ...notifications, customer_health_alerts: e.target.checked })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-700/30 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all">
                      <div>
                        <h3 className="font-medium text-white text-lg">High-Risk Churn Alerts</h3>
                        <p className="text-sm text-gray-400 mt-1">Get notified when customers are at risk of churning</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.churn_risk_alerts} onChange={(e) => setNotifications({ ...notifications, churn_risk_alerts: e.target.checked })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-700/30 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all">
                      <div>
                        <h3 className="font-medium text-white text-lg">Job Status Updates</h3>
                        <p className="text-sm text-gray-400 mt-1">Get notified when jobs are assigned or completed</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications.job_status_updates} onChange={(e) => setNotifications({ ...notifications, job_status_updates: e.target.checked })} className="sr-only peer" />
                        <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end pt-6">
                    <button onClick={saveNotificationPreferences} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium">
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && billingInfo && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
                    <p className="text-gray-400">Manage your subscription and view usage limits.</p>
                  </div>

                  {/* Current Plan Card */}
                  <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-8 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-3xl font-bold text-white capitalize">{billingInfo.plan_type || 'Free'} Plan</h3>
                          {billingInfo.plan_type === 'pro' && (
                            <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">POPULAR</span>
                          )}
                          {billingInfo.plan_type === 'enterprise' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold rounded-full">PREMIUM</span>
                          )}
                        </div>
                        <p className="text-purple-300">
                          {billingInfo.subscription_status === 'active' && billingInfo.current_period_end && 
                            `Renews on ${new Date(billingInfo.current_period_end).toLocaleDateString()}`
                          }
                          {billingInfo.subscription_status === 'past_due' && 
                            <span className="text-red-400">⚠️ Payment past due</span>
                          }
                          {billingInfo.subscription_status === 'canceled' && 
                            <span className="text-yellow-400">Subscription canceled</span>
                          }
                          {!billingInfo.subscription_status && 'Active'}
                        </p>
                      </div>
                      <div className="text-6xl">
                        {billingInfo.plan_type === 'free' && '🆓'}
                        {billingInfo.plan_type === 'pro' && '💎'}
                        {billingInfo.plan_type === 'enterprise' && '👑'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {billingInfo.plan_type === 'free' && (
                        <button
                          onClick={() => window.location.href = '/pricing'}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
                        >
                          🚀 Upgrade Plan
                        </button>
                      )}
                      {(billingInfo.plan_type === 'pro' || billingInfo.plan_type === 'enterprise') && billingInfo.subscription_status === 'active' && (
                        <button
                          onClick={async () => {
                            try {
                              const { url } = await stripeService.createPortalSession(`${window.location.origin}/settings`);
                              window.location.href = url;
                            } catch (error) {
                              console.error('Failed to open portal:', error);
                              alert('Failed to open billing portal');
                            }
                          }}
                          className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                        >
                          ⚙️ Manage Subscription
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Usage & Limits */}
                  {billingInfo.limits && (
                    <div className="bg-gray-800/50 border border-purple-500/20 p-6 rounded-xl">
                      <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                        <span>📊</span>
                        Usage & Limits
                      </h3>
                      <div className="space-y-4">
                        {/* Datasets */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Datasets</span>
                            <span className="font-medium text-white">
                              {billingInfo.usage?.datasets || 0} / {billingInfo.limits.datasets === -1 ? '∞' : billingInfo.limits.datasets}
                            </span>
                          </div>
                          {billingInfo.limits.datasets !== -1 && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((billingInfo.usage?.datasets || 0) / billingInfo.limits.datasets) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Talent Profiles */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Talent Profiles</span>
                            <span className="font-medium text-white">
                              {billingInfo.usage?.talent_profiles || 0} / {billingInfo.limits.talent_profiles === -1 ? '∞' : billingInfo.limits.talent_profiles}
                            </span>
                          </div>
                          {billingInfo.limits.talent_profiles !== -1 && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((billingInfo.usage?.talent_profiles || 0) / billingInfo.limits.talent_profiles) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Jobs */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Jobs</span>
                            <span className="font-medium text-white">
                              {billingInfo.usage?.jobs || 0} / {billingInfo.limits.jobs === -1 ? '∞' : billingInfo.limits.jobs}
                            </span>
                          </div>
                          {billingInfo.limits.jobs !== -1 && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((billingInfo.usage?.jobs || 0) / billingInfo.limits.jobs) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Features */}
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">Features</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              {billingInfo.limits.can_export ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-red-400">✗</span>
                              )}
                              <span className="text-gray-300 text-sm">CSV Export</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {billingInfo.limits.api_access ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-red-400">✗</span>
                              )}
                              <span className="text-gray-300 text-sm">API Access</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing History */}
                  {(billingInfo.plan_type === 'pro' || billingInfo.plan_type === 'enterprise') && (
                    <div className="bg-gray-800/50 border border-purple-500/20 p-6 rounded-xl">
                      <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                        <span>📄</span>
                        Billing Information
                      </h3>
                      <p className="text-gray-400 mb-4">
                        View invoices and payment history in the{' '}
                        <button
                          onClick={async () => {
                            try {
                              const { url } = await stripeService.createPortalSession(`${window.location.origin}/settings`);
                              window.location.href = url;
                            } catch (error) {
                              console.error('Failed to open portal:', error);
                            }
                          }}
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          Stripe Customer Portal
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 border border-purple-500/30 rounded-xl p-8 max-w-2xl w-full mx-4 animate-slide-in">
            <h3 className="text-2xl font-bold text-white mb-6">Create New API Key</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="e.g., Production API Key" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableScopes.map((scope) => (
                    <label key={scope.value} className="flex items-center gap-3 p-3 bg-gray-700/30 border border-purple-500/20 rounded-lg hover:border-purple-500/40 cursor-pointer transition-all">
                      <input type="checkbox" checked={createForm.scopes.includes(scope.value)} onChange={() => toggleScope(scope.value)} className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                      <span className="text-gray-300">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expiration</label>
                <select value={createForm.expires_in_days || ''} onChange={(e) => setCreateForm({ ...createForm, expires_in_days: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Never</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-yellow-400 text-sm">⚠️ The API key will be shown only once. Make sure to copy it!</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setShowCreateModal(false); setCreateForm({ name: '', scopes: [], expires_in_days: null }); }} className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleCreateApiKey} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">Create API Key</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && newApiKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 border border-purple-500/30 rounded-xl p-8 max-w-3xl w-full mx-4 animate-slide-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">API Key Created!</h3>
              <p className="text-gray-400">Make sure to copy your API key now. You won't be able to see it again!</p>
            </div>
            <div className="bg-gray-900/50 border border-green-500/30 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Your API Key</label>
                <button onClick={() => copyToClipboard(newApiKey.api_key)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">📋 Copy</button>
              </div>
              <code className="block p-4 bg-gray-950 rounded text-green-400 font-mono text-sm break-all">{newApiKey.api_key}</code>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-gray-400 text-sm">Name:</span>
                <span className="text-white ml-2">{newApiKey.name}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Scopes:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {newApiKey.scopes && newApiKey.scopes.map((scope, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded">{scope}</span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => { setShowSuccessModal(false); setNewApiKey(null); }} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium">I've Saved My Key</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
