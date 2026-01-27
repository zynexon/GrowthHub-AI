import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    // Extract access token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const token = hashParams.get('access_token')
    
    if (token) {
      setAccessToken(token)
    } else {
      setError('Invalid or expired reset link')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to login with success message
        navigate('/login?reset=success')
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!accessToken) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Invalid Reset Link</h2>
          <p className="text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:scale-105"
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 shadow-2xl animate-scale-in hover:border-purple-500/40 transition-all">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-purple-500/50">
          🔐
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-gray-400">Enter your new password below</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="text-gray-400 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-2"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}
