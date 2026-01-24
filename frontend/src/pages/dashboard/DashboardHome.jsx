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
      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 animate-fade-in-up">
            🚀 Growth Command Center
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Track your growth metrics, manage your team, and drive results
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <Link to="/revops/leads" className="group px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 hover:shadow-2xl">
              <span className="inline-flex items-center gap-2">
                <span>View Leads</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link to="/jobs" className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-105">
              Manage Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics - 4 Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Key Metrics</h2>
          <span className="text-sm text-gray-400">Real-time overview</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hot Leads */}
          <Link to="/revops/leads" className="group relative bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-red-500/30 hover:border-red-500/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">🔥</div>
                <div className="px-3 py-1 bg-red-500/20 rounded-full">
                  <span className="text-xs font-bold text-red-300">HOT</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{revopsData?.hot_leads || 0}</div>
              <div className="text-sm text-red-300 font-medium mb-1">Hot Leads</div>
              <div className="text-xs text-gray-400">Score 80-100 • Ready to convert</div>
            </div>
          </Link>

          {/* Active Talent */}
          <Link to="/talent" className="group relative bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-500/30 hover:border-yellow-500/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">⭐</div>
                <div className="px-3 py-1 bg-yellow-500/20 rounded-full">
                  <span className="text-xs font-bold text-yellow-300">TEAM</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{talentStats?.active_talent || 0}</div>
              <div className="text-sm text-yellow-300 font-medium mb-1">Active Talent</div>
              <div className="text-xs text-gray-400">{talentStats?.completion_rate || 0}% completion rate</div>
            </div>
          </Link>

          {/* Jobs In Progress */}
          <Link to="/jobs" className="group relative bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500/30 hover:border-blue-500/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">💼</div>
                <div className="px-3 py-1 bg-blue-500/20 rounded-full">
                  <span className="text-xs font-bold text-blue-300">ACTIVE</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{jobsStats?.in_progress_jobs || 0}</div>
              <div className="text-sm text-blue-300 font-medium mb-1">Jobs In Progress</div>
              <div className="text-xs text-gray-400">{jobsStats?.total_jobs || 0} total • {jobsStats?.open_jobs || 0} open</div>
            </div>
          </Link>

          {/* Completed Jobs */}
          <Link to="/jobs" className="group relative bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-lg rounded-2xl p-6 border-2 border-green-500/30 hover:border-green-500/60 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all">✅</div>
                <div className="px-3 py-1 bg-green-500/20 rounded-full">
                  <span className="text-xs font-bold text-green-300">DONE</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{jobsStats?.completed_jobs || 0}</div>
              <div className="text-sm text-green-300 font-medium mb-1">Completed Jobs</div>
              <div className="text-xs text-gray-400">This period • On track</div>
            </div>
          </Link>
        </div>
      </div>

      {/* All Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">All Modules</h2>
          <span className="text-sm text-gray-400">Your growth toolkit</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* RevOps */}
          <Link to="/revops/leads" className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/20 hover:border-red-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🎯</div>
                <span className="px-4 py-2 bg-red-500/20 text-red-300 rounded-full text-xs font-bold uppercase tracking-wide">RevOps</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors">Lead Management</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">AI-powered lead scoring and pipeline tracking with intelligent prioritization</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-red-500/10">
                  <div className="text-xl font-bold text-red-400">{revopsData?.hot_leads || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Hot</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-yellow-500/10">
                  <div className="text-xl font-bold text-yellow-400">{revopsData?.warm_leads || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Warm</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-blue-500/10">
                  <div className="text-xl font-bold text-blue-400">{revopsData?.cold_leads || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Cold</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Campaigns */}
          <Link to="/revops/campaigns" className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-green-500/20 hover:border-green-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📈</div>
                <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-xs font-bold uppercase tracking-wide">Marketing</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">Campaign ROI</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Track marketing campaigns, measure attribution, and optimize spend</p>
              <div className="text-center p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/20">
                <div className="text-2xl font-bold text-green-400 mb-1">Track Performance</div>
                <div className="text-xs text-gray-400">Revenue, spend & ROI metrics</div>
              </div>
            </div>
          </Link>

          {/* Customers */}
          <Link to="/customers" className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-pink-500/20 hover:border-pink-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">❤️</div>
                <span className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-full text-xs font-bold uppercase tracking-wide">Success</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">Customer Health</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Monitor health scores, churn risk, and identify expansion opportunities</p>
              <div className="text-center p-4 bg-gradient-to-r from-pink-900/20 to-rose-900/20 rounded-xl border border-pink-500/20">
                <div className="text-2xl font-bold text-pink-400 mb-1">Health Metrics</div>
                <div className="text-xs text-gray-400">Retention & growth tracking</div>
              </div>
            </div>
          </Link>

          {/* Data Labeling */}
          <Link to="/data-labeling" className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-orange-500/20 hover:border-orange-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🏷️</div>
                <span className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full text-xs font-bold uppercase tracking-wide">AI Data</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors">Data Labeling</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Label and annotate datasets for AI model training and validation</p>
              <div className="text-center p-4 bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded-xl border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400 mb-1">Label Datasets</div>
                <div className="text-xs text-gray-400">Training data preparation</div>
              </div>
            </div>
          </Link>

          {/* Talent */}
          <Link to="/talent" className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500/20 hover:border-yellow-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">⭐</div>
                <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wide">People</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">Talent Registry</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Manage team members, track skills, and monitor performance metrics</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-yellow-500/10">
                  <div className="text-xl font-bold text-yellow-400">{talentStats?.active_talent || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Active</div>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-green-500/10">
                  <div className="text-xl font-bold text-green-400">{talentStats?.total_tasks_completed || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Jobs */}
          <Link to="/jobs" className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-blue-500/20 hover:border-blue-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="text-6xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">💼</div>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide">Tasks</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">Job Tracker</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">Simple task management for company work with team assignments</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-gray-500/10">
                  <div className="text-lg font-bold text-gray-400">{jobsStats?.open_jobs || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Open</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-yellow-500/10">
                  <div className="text-lg font-bold text-yellow-400">{jobsStats?.in_progress_jobs || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Active</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-green-500/10">
                  <div className="text-lg font-bold text-green-400">{jobsStats?.completed_jobs || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Done</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Quick Actions</h2>
          <span className="text-sm text-gray-400">Common tasks</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/revops/leads" className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all">📥</div>
              <div className="text-sm font-semibold text-white">Upload Leads</div>
              <div className="text-xs text-gray-500 mt-1">Import CSV</div>
            </div>
          </Link>
          <Link to="/jobs" className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all">➕</div>
              <div className="text-sm font-semibold text-white">Create Job</div>
              <div className="text-xs text-gray-500 mt-1">New task</div>
            </div>
          </Link>
          <Link to="/talent" className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all">👤</div>
              <div className="text-sm font-semibold text-white">Add Talent</div>
              <div className="text-xs text-gray-500 mt-1">Team member</div>
            </div>
          </Link>
          <Link to="/data-labeling" className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all">🏷️</div>
              <div className="text-sm font-semibold text-white">Label Data</div>
              <div className="text-xs text-gray-500 mt-1">Start labeling</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
