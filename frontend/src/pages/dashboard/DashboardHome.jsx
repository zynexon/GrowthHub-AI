import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { revopsService } from '../../services/revops.service'

export default function DashboardHome() {
  const { user, currentOrganization } = useAuthStore()
  const [isVisible, setIsVisible] = useState({})

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => revopsService.getDashboardStats(),
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const stats = [
    { 
      label: '🔥 Hot Leads', 
      value: dashboardData?.hot_leads || 0, 
      subtext: 'Score 80-100', 
      icon: '🔥', 
      color: 'red',
      link: '/revops/leads?filter=hot'
    },
    { 
      label: '🟡 Warm Leads', 
      value: dashboardData?.warm_leads || 0, 
      subtext: 'Score 50-79', 
      icon: '🟡', 
      color: 'yellow',
      link: '/revops/leads?filter=warm'
    },
    { 
      label: '🔵 Cold Leads', 
      value: dashboardData?.cold_leads || 0, 
      subtext: 'Score <50', 
      icon: '🔵', 
      color: 'blue',
      link: '/revops/leads?filter=cold'
    },
    { 
      label: 'Follow-Ups Needed', 
      value: dashboardData?.needs_followup || 0, 
      subtext: 'Contacted >3 days ago', 
      icon: '⏰', 
      color: 'purple',
      link: '/revops/leads?filter=followup'
    },
  ]

  const quickActions = [
    { title: 'Upload Leads', desc: 'Import and score new leads', icon: '📥', link: '/revops/leads', color: 'blue' },
    { title: 'View Campaigns', desc: 'Track campaign ROI metrics', icon: '🎯', link: '/revops/campaigns', color: 'green' },
    { title: 'Hot Leads', desc: 'Focus on high-score leads', icon: '🔥', link: '/revops/leads?filter=hot', color: 'red' },
    { title: 'Follow-ups', desc: 'Contacts needing attention', icon: '⏰', link: '/revops/leads?filter=followup', color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden animate-fade-in-up">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 animate-slide-in-left">
            Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
          </h1>
          <p className="text-xl text-blue-100 mb-4 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            RevOps Dashboard - Lead scoring & campaign tracking
          </p>
          <div className="flex gap-4 mt-6 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <Link to="/revops/leads" className="group px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-blue-50 transition-all hover:scale-105 hover:shadow-lg">
              <span className="inline-flex items-center gap-2">
                View Leads
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link to="/revops/campaigns" className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all hover:scale-105">
              Campaign ROI
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            to={stat.link}
            key={index} 
            data-animate 
            id={`stat-${index}`}
            className={`group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 cursor-pointer hover:scale-105 shadow-lg hover:shadow-purple-500/20 ${
              isVisible[`stat-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">{stat.label}</div>
                <div className={`text-3xl font-bold mb-2 group-hover:scale-110 transition-transform origin-left ${
                  stat.color === 'red' ? 'text-red-400' :
                  stat.color === 'yellow' ? 'text-yellow-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  'text-purple-400'
                }`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.subtext}</div>
              </div>
              <div className="text-4xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300">{stat.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div id="quick-actions" data-animate className={`transition-all duration-1000 ${
        isVisible['quick-actions'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h2 className="text-2xl font-bold mb-4 text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 ${
                action.color === 'blue' ? 'border-blue-500/20 hover:border-blue-500 hover:shadow-blue-500/20' :
                action.color === 'red' ? 'border-red-500/20 hover:border-red-500 hover:shadow-red-500/20' :
                action.color === 'green' ? 'border-green-500/20 hover:border-green-500 hover:shadow-green-500/20' :
                'border-purple-500/20 hover:border-purple-500 hover:shadow-purple-500/20'
              }`}
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{action.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300">{action.title}</h3>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{action.desc}</p>
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-sm font-medium inline-flex items-center gap-1 ${
                  action.color === 'blue' ? 'text-blue-400' :
                  action.color === 'red' ? 'text-red-400' :
                  action.color === 'green' ? 'text-green-400' :
                  'text-purple-400'
                }`}>
                  Get started
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Campaigns & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Campaigns */}
        <div 
          id="campaigns" 
          data-animate 
          className={`lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-1000 ${
            isVisible.campaigns ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎯</span> Top Campaigns by ROI
            </h2>
            <Link to="/revops/campaigns" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData?.top_campaigns?.length > 0 ? (
              dashboardData.top_campaigns.slice(0, 4).map((campaign, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-4 rounded-lg hover:bg-gray-800/50 transition-all duration-300 cursor-pointer hover:scale-102 border border-transparent hover:border-purple-500/30"
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-1">
                    <p className="text-white font-medium group-hover:text-purple-300 transition-colors">{campaign.name}</p>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      {campaign.lead_count} leads • {campaign.conversion_count} conversions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      campaign.roi > 3 ? 'text-green-400' :
                      campaign.roi > 1 ? 'text-yellow-400' :
                      campaign.roi > 0 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {(campaign.roi * 100).toFixed(0)}% ROI
                    </p>
                    <p className="text-sm text-gray-500">
                      ${(campaign.revenue || 0).toLocaleString()} revenue
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">📊</p>
                <p>No campaign data yet</p>
                <Link to="/revops/campaigns" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
                  Upload campaigns CSV →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div 
          id="performance" 
          data-animate 
          className={`bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-1000 ${
            isVisible.performance ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
        >
          <h2 className="text-xl font-bold mb-4 text-white">Lead Distribution</h2>
          <div className="space-y-4">
            <div className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 group-hover:text-white transition-colors">🔥 Hot Leads</span>
                <span className="font-semibold text-red-400">{dashboardData?.hot_leads || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg group-hover:shadow-red-500/50" 
                  style={{ 
                    width: isVisible.performance ? `${Math.min(((dashboardData?.hot_leads || 0) / (dashboardData?.total_leads || 1)) * 100, 100)}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 group-hover:text-white transition-colors">🟡 Warm Leads</span>
                <span className="font-semibold text-yellow-400">{dashboardData?.warm_leads || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg group-hover:shadow-yellow-500/50" 
                  style={{ 
                    width: isVisible.performance ? `${Math.min(((dashboardData?.warm_leads || 0) / (dashboardData?.total_leads || 1)) * 100, 100)}%` : '0%',
                    transitionDelay: '0.2s' 
                  }}
                ></div>
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 group-hover:text-white transition-colors">🔵 Cold Leads</span>
                <span className="font-semibold text-blue-400">{dashboardData?.cold_leads || 0}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg group-hover:shadow-blue-500/50" 
                  style={{ 
                    width: isVisible.performance ? `${Math.min(((dashboardData?.cold_leads || 0) / (dashboardData?.total_leads || 1)) * 100, 100)}%` : '0%',
                    transitionDelay: '0.4s' 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <Link to="/revops/leads" className="group w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 relative overflow-hidden inline-flex items-center justify-center">
            <span className="relative z-10 inline-flex items-center gap-2">
              View All Leads
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
        </div>
      </div>
    </div>
  )
}
