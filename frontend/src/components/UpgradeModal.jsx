import { useState } from 'react'
import stripeService from '../services/stripe.service'

export default function UpgradeModal({ show, onClose, resourceType, currentPlan = 'free' }) {
  const [loading, setLoading] = useState(false)

  const resourceMessages = {
    datasets: {
      title: 'Dataset Limit Reached',
      message: 'You\'ve reached the maximum number of datasets for your plan.',
      free: '1 dataset',
      pro: '10 datasets',
      enterprise: 'Unlimited datasets'
    },
    talent: {
      title: 'Talent Limit Reached',
      message: 'You\'ve reached the maximum number of talent profiles for your plan.',
      free: '3 talent profiles',
      pro: '20 talent profiles',
      enterprise: 'Unlimited talent profiles'
    },
    jobs: {
      title: 'Jobs Limit Reached',
      message: 'You\'ve reached the maximum number of jobs for your plan.',
      free: '3 jobs',
      pro: 'Unlimited jobs',
      enterprise: 'Unlimited jobs'
    },
    export: {
      title: 'Export Not Available',
      message: 'CSV export is not available on the Free plan.',
      free: 'No exports',
      pro: 'CSV exports included',
      enterprise: 'CSV exports included'
    },
    api_access: {
      title: 'API Access Not Available',
      message: 'API access is not available on the Free plan.',
      free: 'No API access',
      pro: 'Limited API access',
      enterprise: 'Full API access'
    }
  }

  const handleUpgrade = async (planType) => {
    try {
      setLoading(true)
      const session = await stripeService.createCheckoutSession(
        planType,
        `${window.location.origin}/settings?success=true`,
        window.location.href
      )
      window.location.href = session.url
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (!show) return null

  const info = resourceMessages[resourceType] || resourceMessages.datasets

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full animate-slide-in">
        <div className="p-8">
          {/* Icon and Title */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-2">{info.title}</h3>
            <p className="text-gray-400">{info.message}</p>
          </div>

          {/* Plans Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/50 rounded-xl p-6">
              <div className="text-xs font-bold text-purple-400 mb-2">RECOMMENDED</div>
              <h4 className="text-xl font-bold text-white mb-2">Pro Plan</h4>
              <div className="text-3xl font-bold text-white mb-4">$49<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  {info.pro}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  Up to 10,000 rows total
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  Export to CSV
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  Limited API access
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
              <div className="text-xs font-bold text-gray-500 mb-2">ENTERPRISE</div>
              <h4 className="text-xl font-bold text-white mb-2">Enterprise</h4>
              <div className="text-3xl font-bold text-white mb-4">$199<span className="text-sm text-gray-400">/mo</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  {info.enterprise}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  Unlimited rows
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  All features
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  Full API access
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade('enterprise')}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>

          {/* Current Plan Info */}
          <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-400 mb-1">Your Current Plan</div>
            <div className="text-white font-semibold">Free - {info.free}</div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
