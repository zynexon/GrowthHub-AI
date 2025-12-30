import api from './api'

export const authService = {
  async signup(formData) {
    const response = await api.post('/auth/signup', {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      organizationName: formData.organizationName,
    })
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async getUserOrganizations() {
    const response = await api.get('/auth/organizations')
    return response.data
  },
}
