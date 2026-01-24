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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-semibold animate-pulse-slow">
              💎 Flexible Pricing Plans
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-slide-in-up">
            Choose Your Growth Path
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up">
            Scale your business with AI-powered growth tools. Start free, upgrade when you're ready.
          </p>
        </div>

        {/* Current Plan Banner */}
        {currentSubscription && currentSubscription.plan_type !== 'free' && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-500/40 rounded-2xl p-6 mb-12 backdrop-blur-lg animate-scale-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <span className="text-2xl">🎉</span>
                  <span className="text-sm text-purple-300 font-semibold">ACTIVE SUBSCRIPTION</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{currentSubscription.plan_name}</div>
                {currentSubscription.current_period_end && (
                  <div className="text-sm text-gray-400">
                    Renews on {new Date(currentSubscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              <button
                onClick={handleManageSubscription}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105 shadow-lg"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {sortedPlans.map((plan, index) => {
            const isCurrentPlan = currentSubscription?.plan_type === plan.key
            const isFree = plan.key === 'free'
            const isPro = plan.key === 'pro'
            const isEnterprise = plan.key === 'enterprise'
            
            return (
              <div
                key={plan.key}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`relative bg-gradient-to-br backdrop-blur-xl rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up ${
                  isPro
                    ? 'from-purple-900/40 via-purple-800/30 to-blue-900/40 border-purple-500/60 shadow-xl shadow-purple-500/30 md:scale-105' 
                    : isEnterprise
                    ? 'from-blue-900/40 via-indigo-900/30 to-purple-900/40 border-blue-500/50'
                    : 'from-gray-900/60 to-gray-800/40 border-gray-700/50'
                }`}
              >
                {isPro && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient"></div>
                )}
                
                {isPro && (
                  <div className="absolute -top-0 -right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                )}

                {isPro && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg animate-pulse-glow">
                    ⭐ MOST POPULAR
                  </div>
                )}

                {isEnterprise && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
                    🚀 BEST VALUE
                  </div>
                )}

                <div className="p-8 relative z-10">
                  {/* Icon & Plan Name */}
                  <div className="mb-6">
                    <div className="text-5xl mb-4 animate-float">
                      {isFree ? '🌱' : isPro ? '⚡' : '🏆'}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {isFree ? 'Perfect for getting started' : isPro ? 'For growing businesses' : 'For large organizations'}
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="mb-8">
                    {isFree ? (
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">$0</span>
                        <span className="text-gray-400 ml-2 text-lg">/month</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className={`text-5xl font-bold ${
                          isPro 
                            ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent' 
                            : 'bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent'
                        }`}>
                          ${plan.price / 100}
                        </span>
                        <span className="text-gray-400 ml-2 text-lg">/month</span>
                      </div>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      {isFree ? 'Free forever' : 'Billed monthly'}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          isPro ? 'bg-purple-500/20' : isEnterprise ? 'bg-blue-500/20' : 'bg-gray-700/50'
                        }`}>
                          <span className={`text-xs ${
                            isPro ? 'text-purple-400' : isEnterprise ? 'text-blue-400' : 'text-green-400'
                          }`}>✓</span>
                        </div>
                        <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full px-6 py-4 bg-gray-700/50 border-2 border-gray-600 text-gray-400 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      <span>Current Plan</span>
                    </button>
                  ) : isFree ? (
                    <button
                      disabled
                      className="w-full px-6 py-4 bg-gray-700/30 border-2 border-gray-600/50 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                    >
                      Free Forever
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      className={`w-full px-6 py-4 rounded-xl font-semibold transition-all relative overflow-hidden group ${
                        isPro
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/60 border-2 border-purple-400/50'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/60 border-2 border-blue-400/50'
                      } hover:scale-105`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>Upgrade to {plan.name}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">Everything you need to know about our pricing</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                    Can I change plans at any time?
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <span className="text-2xl">💾</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                    What happens to my data if I downgrade?
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Your data is never deleted. If you exceed limits after downgrading, you'll be prompted to upgrade or remove excess items.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:border-green-500/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-green-300 transition-colors">
                    Do you offer refunds?
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 hover:border-pink-500/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-pink-300 transition-colors">
                    Is my data secure?
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Yes, we use enterprise-grade security with encrypted data storage and Row Level Security to ensure your data is isolated and protected at all times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-blue-900/30 border-2 border-purple-500/30 rounded-2xl p-8 sm:p-12 text-center backdrop-blur-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Our team is here to help you choose the right plan for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl">
                Contact Sales
              </button>
              <a 
                href="https://drive.google.com/file/d/1sX3Jw82-27YNjsnGB9sNi3fikEufRkPZ/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105 inline-block text-center"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
