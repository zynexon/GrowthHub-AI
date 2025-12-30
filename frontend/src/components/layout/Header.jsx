import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, currentOrganization, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-gray-900/50 backdrop-blur-lg border-b border-purple-500/20 px-6 py-4 animate-slide-in-left">
      <div className="flex items-center justify-between">
        <div>
          {currentOrganization && (
            <div className="flex items-center gap-2 group">
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Organization:</span>
              <span className="font-medium text-white group-hover:text-purple-300 transition-colors">{currentOrganization.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="group p-2 hover:bg-gray-800 rounded-lg relative transition-all hover:scale-110">
            <span className="text-xl group-hover:animate-float">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white hover:text-purple-300 transition-colors cursor-default">{user?.user_metadata?.full_name || 'Demo User'}</div>
              <div className="text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-default">
                {user?.email || 'demo@growthhub.ai'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 relative overflow-hidden"
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
