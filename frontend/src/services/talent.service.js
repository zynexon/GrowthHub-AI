import api from './api'

export const talentService = {
  // Get all talent
  getAllTalent: async () => {
    const response = await api.get('/talent')
    return response.data.talent || []
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/talent/statistics')
    return response.data
  },

  // Get single talent
  getTalent: async (id) => {
    const response = await api.get(`/talent/${id}`)
    return response.data.talent
  },

  // Create talent
  createTalent: async (name, email, skillType) => {
    const response = await api.post('/talent', {
      name,
      email,
      skill_type: skillType
    })
    return response.data
  },

  // Update talent
  updateTalent: async (id, data) => {
    const response = await api.put(`/talent/${id}`, {
      name: data.name,
      email: data.email,
      skill_type: data.skillType
    })
    return response.data
  },

  // Toggle status
  toggleStatus: async (id) => {
    const response = await api.patch(`/talent/${id}/status`)
    return response.data
  },

  // Delete talent
  deleteTalent: async (id) => {
    const response = await api.delete(`/talent/${id}`)
    return response.data
  }
}
