import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Header({ onMenuClick }) {
  const { user, currentOrganization, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-gray-900/50 backdrop-blur-lg border-b border-purple-500/20 px-4 sm:px-6 py-3 sm:py-4 animate-slide-in-left">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {currentOrganization && (
            <div className="hidden sm:flex items-center gap-2 group">
              <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Organization:</span>
              <span className="font-medium text-white text-sm sm:text-base group-hover:text-purple-300 transition-colors truncate max-w-[120px] sm:max-w-none">{currentOrganization.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-white hover:text-purple-300 transition-colors cursor-default truncate max-w-[150px]">{user?.user_metadata?.full_name || 'Demo User'}</div>
              <div className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-default truncate max-w-[150px]">
                {user?.email || 'demo@growthhub.ai'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10">Logout</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
