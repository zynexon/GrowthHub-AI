import api from './api'

export const revopsService = {
  // Leads
  async getLeads(sortBy = 'score') {
    const response = await api.get('/revops/leads', {
      params: { sort_by: sortBy },
    })
    return response.data
  },

  async createLead(data) {
    const response = await api.post('/revops/leads', data)
    return response.data
  },

  async updateLead(leadId, data) {
    const response = await api.put(`/revops/leads/${leadId}`, data)
    return response.data
  },

  async uploadLeadsCSV(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/revops/leads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getLeadDetails(leadId) {
    const response = await api.get(`/revops/leads/${leadId}`)
    return response.data
  },

  async clearLeads() {
    const response = await api.delete('/revops/leads/clear')
    return response.data
  },

  async clearCampaigns() {
    const response = await api.delete('/revops/campaigns/clear')
    return response.data
  },

  // Campaigns
  async getCampaigns() {
    const response = await api.get('/revops/campaigns')
    return response.data
  },

  async createCampaign(data) {
    const response = await api.post('/revops/campaigns', data)
    return response.data
  },

  async uploadCampaignsCSV(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/revops/campaigns/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Dashboard
  async getDashboardStats() {
    const response = await api.get('/revops/dashboard')
    return response.data
  },
}
