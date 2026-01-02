import api from './api';

export const settingsService = {
  // Organization Settings
  getOrganizationSettings: async () => {
    const response = await api.get('/settings/organization');
    return response.data;
  },

  updateOrganizationSettings: async (updates) => {
    const response = await api.patch('/settings/organization', updates);
    return response.data;
  },

  // User Profile
  getUserProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateUserProfile: async (updates) => {
    const response = await api.patch('/settings/profile', updates);
    return response.data;
  },

  changePassword: async (newPassword) => {
    const response = await api.post('/settings/profile/password', { new_password: newPassword });
    return response.data;
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    const response = await api.get('/settings/notifications');
    return response.data;
  },

  updateNotificationPreferences: async (updates) => {
    const response = await api.patch('/settings/notifications', updates);
    return response.data;
  },

  // Billing & Plan
  getBillingInfo: async () => {
    const response = await api.get('/settings/billing');
    return response.data;
  },
};
