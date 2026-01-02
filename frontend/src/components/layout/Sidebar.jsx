import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Leads', href: '/revops/leads', icon: '🎯' },
    { name: 'Campaigns', href: '/revops/campaigns', icon: '📈' },
    { name: 'Customers', href: '/customers', icon: '❤️' },
    { name: 'Data Labeling', href: '/data-labeling', icon: '🏷️' },
    { name: 'Talent', href: '/talent', icon: '⭐' },
    { name: 'Jobs', href: '/jobs', icon: '💼' }
  ]

  const bottomNavigation = [
    { name: 'Settings', href: '/settings', icon: '⚙️' }
  ]

  return (
    <div className="w-64 fixed left-0 top-0 h-screen bg-gray-900 border-r border-purple-500/20 flex flex-col shadow-xl animate-slide-in-right overflow-y-auto z-50">
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            G
          </div>
          <h1 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">GrowthHub AI</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 animate-fade-in-up ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105 hover:translate-x-1'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className={`text-xl transition-transform duration-300 ${
                isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'
              }`}>{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {!isActive && (
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation (Settings) */}
      <div className="p-4 space-y-1 border-t border-purple-500/20">
        {bottomNavigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105 hover:translate-x-1'
              }`}
            >
              <span className={`text-xl transition-transform duration-300 ${
                isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'
              }`}>{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {!isActive && (
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-purple-500/20">
        <div className="text-xs text-gray-500 text-center hover:text-gray-400 transition-colors cursor-default">
          © 2025 GrowthHub AI
        </div>
      </div>
    </div>
  )
}
