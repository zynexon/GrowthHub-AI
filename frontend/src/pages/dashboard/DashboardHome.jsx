import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { revopsService } from '../../services/revops.service'
import { talentService } from '../../services/talent.service'
import { jobsService } from '../../services/jobs.service'

export default function DashboardHome() {
  const { user } = useAuthStore()

  // Fetch all module statistics
  const { data: revopsData } = useQuery({
    queryKey: ['dashboard-revops'],
    queryFn: () => revopsService.getDashboardStats(),
  })

  const { data: talentStats } = useQuery({
    queryKey: ['dashboard-talent'],
    queryFn: () => talentService.getStatistics(),
  })

  const { data: jobsStats } = useQuery({
    queryKey: ['dashboard-jobs'],
    queryFn: () => jobsService.getStatistics(),
  })

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Your Growth Command Center
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/revops/leads" className="group px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 hover:shadow-xl">
              <span className="inline-flex items-center gap-2">
                View Leads
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link to="/jobs" className="px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-105">
              Manage Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Module Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* RevOps Stats */}
        <Link to="/revops/leads" className="group bg-gradient-to-br from-red-900/20 to-red-800/20 backdrop-blur-lg rounded-xl p-6 border border-red-500/30 hover:border-red-500/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/20">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔥</div>
          <div className="text-3xl font-bold text-white mb-1">{revopsData?.hot_leads || 0}</div>
          <div className="text-sm text-red-300 font-medium">Hot Leads</div>
          <div className="text-xs text-gray-400 mt-1">Score 80-100</div>
        </Link>

        <Link to="/talent" className="group bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-500/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⭐</div>
          <div className="text-3xl font-bold text-white mb-1">{talentStats?.active_talent || 0}</div>
          <div className="text-sm text-yellow-300 font-medium">Active Talent</div>
          <div className="text-xs text-gray-400 mt-1">{talentStats?.completion_rate || 0}% completion</div>
        </Link>

        <Link to="/jobs" className="group bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💼</div>
          <div className="text-3xl font-bold text-white mb-1">{jobsStats?.in_progress_jobs || 0}</div>
          <div className="text-sm text-blue-300 font-medium">Jobs In Progress</div>
          <div className="text-xs text-gray-400 mt-1">{jobsStats?.total_jobs || 0} total jobs</div>
        </Link>

        <Link to="/jobs" className="group bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✅</div>
          <div className="text-3xl font-bold text-white mb-1">{jobsStats?.completed_jobs || 0}</div>
          <div className="text-sm text-green-300 font-medium">Completed Jobs</div>
          <div className="text-xs text-gray-400 mt-1">This period</div>
        </Link>
      </div>

      {/* All Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">All Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* RevOps */}
          <Link to="/revops/leads" className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">🎯</div>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">RevOps</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Lead Management</h3>
            <p className="text-gray-400 text-sm mb-4">AI-powered lead scoring and pipeline tracking</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-red-400">{revopsData?.hot_leads || 0}</div>
                <div className="text-xs text-gray-500">Hot</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{revopsData?.warm_leads || 0}</div>
                <div className="text-xs text-gray-500">Warm</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{revopsData?.cold_leads || 0}</div>
                <div className="text-xs text-gray-500">Cold</div>
              </div>
            </div>
          </Link>

          {/* Campaigns */}
          <Link to="/revops/campaigns" className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">📈</div>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">Marketing</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campaign ROI</h3>
            <p className="text-gray-400 text-sm mb-4">Track marketing campaigns and attribution</p>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">Track Revenue</div>
              <div className="text-xs text-gray-500 mt-1">Per campaign performance</div>
            </div>
          </Link>

          {/* Customers */}
          <Link to="/customers" className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">❤️</div>
              <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs font-medium">Success</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Customer Health</h3>
            <p className="text-gray-400 text-sm mb-4">Monitor health scores and churn risk</p>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">Track Metrics</div>
              <div className="text-xs text-gray-500 mt-1">Health & retention</div>
            </div>
          </Link>

          {/* Data Labeling */}
          <Link to="/data-labeling" className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">🏷️</div>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium">AI Data</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Data Labeling</h3>
            <p className="text-gray-400 text-sm mb-4">Label datasets for AI model training</p>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">Label Data</div>
              <div className="text-xs text-gray-500 mt-1">Training datasets</div>
            </div>
          </Link>

          {/* Talent */}
          <Link to="/talent" className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">⭐</div>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">People</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Talent Registry</h3>
            <p className="text-gray-400 text-sm mb-4">Manage team members and track performance</p>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{talentStats?.active_talent || 0}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{talentStats?.tasks_completed || 0}</div>
                <div className="text-xs text-gray-500">Tasks Done</div>
              </div>
            </div>
          </Link>

          {/* Jobs */}
          <Link to="/jobs" className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">💼</div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">Tasks</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Job Tracker</h3>
            <p className="text-gray-400 text-sm mb-4">Simple task management for company work</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-400">{jobsStats?.open_jobs || 0}</div>
                <div className="text-xs text-gray-500">Open</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{jobsStats?.in_progress_jobs || 0}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{jobsStats?.completed_jobs || 0}</div>
                <div className="text-xs text-gray-500">Done</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/revops/leads" className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📥</div>
            <div className="text-sm font-medium text-white">Upload Leads</div>
          </Link>
          <Link to="/jobs" className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</div>
            <div className="text-sm font-medium text-white">Create Job</div>
          </Link>
          <Link to="/talent" className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
            <div className="text-sm font-medium text-white">Add Talent</div>
          </Link>
          <Link to="/data-labeling" className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏷️</div>
            <div className="text-sm font-medium text-white">Label Data</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
