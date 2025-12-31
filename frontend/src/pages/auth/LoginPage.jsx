import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth.service'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await authService.login(formData.email, formData.password)
      
      if (result.user && result.session) {
        login(result.user, result.session, result.organization)
        navigate('/dashboard')
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoMode = () => {
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@growthhub.ai',
      user_metadata: { full_name: 'Demo User' }
    }
    const mockSession = { access_token: 'demo-token-123' }
    const mockOrg = {
      id: 'demo-org-123',
      name: 'Demo Company',
      created_at: new Date().toISOString()
    }
    
    login(mockUser, mockSession, mockOrg)
    navigate('/dashboard')
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 shadow-2xl animate-scale-in hover:border-purple-500/40 transition-all">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-purple-500/50 animate-float hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer">
          G
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">Welcome Back</h2>
        <p className="text-gray-400 animate-fade-in-up" style={{animationDelay: '0.1s'}}>Sign in to your GrowthHub AI account</p>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="group w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-purple-500/70 relative overflow-hidden"
        >
          <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800/50 text-gray-400">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoMode}
          className="group w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-500 transition-all shadow-lg shadow-gray-500/30 hover:scale-105 hover:shadow-gray-500/50 border border-gray-500/30 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-xl">🚀</span>
            Try Demo Mode
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
