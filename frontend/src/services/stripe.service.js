import api from './api'

export const stripeService = {
  // Get all plans
  getPlans: async () => {
    const response = await api.get('/stripe/plans')
    return response.data.plans
  },

  // Get current subscription
  getSubscription: async () => {
    const response = await api.get('/stripe/subscription')
    return response.data
  },

  // Check limit for a resource
  checkLimit: async (resourceType) => {
    const response = await api.get(`/stripe/check-limit/${resourceType}`)
    return response.data
  },

  // Create checkout session
  createCheckoutSession: async (planType, successUrl, cancelUrl) => {
    const response = await api.post('/stripe/create-checkout-session', {
      plan_type: planType,
      success_url: successUrl,
      cancel_url: cancelUrl
    })
    return response.data
  },

  // Create customer portal session
  createPortalSession: async (returnUrl) => {
    const response = await api.post('/stripe/create-portal-session', {
      return_url: returnUrl
    })
    return response.data
  }
}

export default stripeService
