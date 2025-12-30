import api from './api'

export const customerHealthService = {
  getCustomers: async (filter = null) => {
    const params = filter ? `?filter=${filter}` : ''
    const response = await api.get(`/customer-health/customers${params}`)
    return response.data
  },

  getCustomer: async (customerId) => {
    const response = await api.get(`/customer-health/customers/${customerId}`)
    return response.data
  },

  createCustomer: async (data) => {
    const response = await api.post('/customer-health/customers', data)
    return response.data
  },

  uploadCustomersCSV: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/customer-health/customers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getDashboardStats: async () => {
    const response = await api.get('/customer-health/dashboard')
    return response.data
  }
}
