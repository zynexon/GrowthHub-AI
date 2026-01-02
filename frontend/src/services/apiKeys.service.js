import api from './api'

export const apiKeysService = {
  // Get all API keys
  getAllKeys: async () => {
    const response = await api.get('/api-keys')
    return response.data.keys || []
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/api-keys/statistics')
    return response.data
  },

  // Create API key
  createKey: async (name, scopes, expiresInDays) => {
    const response = await api.post('/api-keys', {
      name,
      scopes,
      expires_in_days: expiresInDays
    })
    return response.data
  },

  // Revoke API key
  revokeKey: async (keyId) => {
    const response = await api.patch(`/api-keys/${keyId}/revoke`)
    return response.data
  },

  // Delete API key
  deleteKey: async (keyId) => {
    const response = await api.delete(`/api-keys/${keyId}`)
    return response.data
  }
}
