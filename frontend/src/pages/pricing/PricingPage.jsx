import { useState, useEffect } from 'react'
import stripeService from '../../services/stripe.service'

export default function PricingPage() {
  const [plans, setPlans] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [plansData, subData] = await Promise.all([
        stripeService.getPlans(),
        stripeService.getSubscription()
      ])
      setPlans(plansData)
      setCurrentSubscription(subData)
    } catch (error) {
      console.error('Error loading pricing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planType) => {
    try {
      const session = await stripeService.createCheckoutSession(
        planType,
        `${window.location.origin}/settings?success=true`,
        `${window.location.origin}/pricing?canceled=true`
      )
      
      // Redirect to Stripe Checkout
      window.location.href = session.url
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
    }
  }

  const handleManageSubscription = async () => {
    try {
      const session = await stripeService.createPortalSession(
        `${window.location.origin}/settings`
      )
      window.location.href = session.url
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Failed to open subscription portal. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading pricing...</div>
      </div>
    )
  }

  const planOrder = ['free', 'pro', 'enterprise']
  const sortedPlans = planOrder.map(key => ({ key, ...plans[key] }))

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-400">Scale your growth operations with the right tools</p>
      </div>

      {/* Current Plan Banner */}
      {currentSubscription && currentSubscription.plan_type !== 'free' && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Current Plan</div>
              <div className="text-2xl font-bold text-white">{currentSubscription.plan_name}</div>
              {currentSubscription.current_period_end && (
                <div className="text-sm text-gray-400 mt-1">
                  Renews {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </div>
              )}
            </div>
            <button
              onClick={handleManageSubscription}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan_type === plan.key
          const isFree = plan.key === 'free'
          
          return (
            <div
              key={plan.key}
              className={`relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-2xl border ${
                plan.key === 'pro' 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : 'border-gray-700/50'
              } overflow-hidden transition-all hover:scale-105`}
            >
              {plan.key === 'pro' && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                
                {/* Price */}
                <div className="mb-6">
                  {isFree ? (
                    <div className="text-4xl font-bold text-white">Free</div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">${plan.price / 100}</span>
                      <span className="text-gray-400 ml-2">/month</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-700 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : isFree ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-700 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Free Forever
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                      plan.key === 'pro'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">Can I change plans at any time?</h3>
            <p className="text-gray-400 text-sm">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">What happens to my data if I downgrade?</h3>
            <p className="text-gray-400 text-sm">Your data is never deleted. If you exceed limits after downgrading, you'll be prompted to upgrade or remove excess items.</p>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-gray-400 text-sm">Yes, we offer a 30-day money-back guarantee on all paid plans.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
