import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const authStorage = localStorage.getItem('auth-storage')
    console.log('[API] Auth storage:', authStorage)
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      let { session, currentOrganization } = parsed.state
      
      console.log('[API] Session:', session?.access_token ? 'exists' : 'missing')
      console.log('[API] Organization:', currentOrganization)
      
      // If organization is missing but we have a session, fetch it and WAIT
      if (session?.access_token && !currentOrganization) {
        console.log('[API] Fetching organization...')
        try {
          const response = await fetch('http://localhost:5000/api/auth/organizations', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.organizations && data.organizations.length > 0) {
              currentOrganization = data.organizations[0].organizations
              // Update localStorage
              parsed.state.currentOrganization = currentOrganization
              localStorage.setItem('auth-storage', JSON.stringify(parsed))
              console.log('[API] Organization fetched and stored:', currentOrganization)
            } else {
              console.error('[API] No organizations found in response')
              return Promise.reject(new Error('No organization found. Please contact support.'))
            }
          } else {
            console.error('[API] Failed to fetch organization:', response.status)
            return Promise.reject(new Error('Failed to load organization data'))
          }
        } catch (err) {
          console.error('[API] Failed to fetch organization:', err)
          return Promise.reject(err)
        }
      }
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
      
      if (currentOrganization?.id) {
        config.headers['X-Organization-Id'] = currentOrganization.id
        console.log('[API] Added X-Organization-Id header:', currentOrganization.id)
      } else {
        console.error('[API] No organization ID available for request')
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
