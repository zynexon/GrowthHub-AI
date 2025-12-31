import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { revopsService } from '../../services/revops.service'

export default function LeadsPage() {
  const [uploadingFile, setUploadingFile] = useState(false)
  const [sortBy, setSortBy] = useState('score')
  const [showFormatInfo, setShowFormatInfo] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leads', sortBy],
    queryFn: () => revopsService.getLeads(sortBy),
  })

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      await revopsService.uploadLeadsCSV(file)
      refetch()
      alert('Leads uploaded successfully!')
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const getTemperatureIcon = (temp) => {
    switch (temp) {
      case 'hot': return '🔥'
      case 'warm': return '🟡'
      case 'cold': return '🔵'
      default: return '⚪'
    }
  }

  const getTemperatureColor = (temp) => {
    switch (temp) {
      case 'hot': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'warm': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cold': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'qualified': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'converted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'lost': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leads Management</h1>
          <p className="text-gray-400">Upload, score, and manage your leads with AI</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFormatInfo(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 text-gray-300 rounded-lg font-medium hover:bg-gray-700/50 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
            title="CSV Format Info"
          >
            <span className="text-xl">ℹ️</span>
            <span>Format</span>
          </button>
          
          <label className="group btn-primary cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105 hover:shadow-purple-500/70">
            <span className="text-lg">⬆️</span>
            {uploadingFile ? 'Uploading...' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploadingFile}
            />
          </label>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-3">
        <button
          onClick={() => setSortBy('score')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'score'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Sort by Score
        </button>
        <button
          onClick={() => setSortBy('created_at')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'created_at'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Sort by Date
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden hover:border-purple-500/30 transition-all">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading leads...</p>
          </div>
        ) : data?.leads?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20 bg-gray-900/50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Score</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Temp</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Company</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Source</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead, index) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          lead.score >= 80 ? 'text-red-400' :
                          lead.score >= 50 ? 'text-yellow-400' :
                          'text-blue-400'
                        } group-hover:scale-110 transition-transform`}>
                          {lead.score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getTemperatureColor(lead.temperature)}`}>
                        {getTemperatureIcon(lead.temperature)} {lead.temperature || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white group-hover:text-purple-300 transition-colors font-medium">
                      {lead.name || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-gray-300">{lead.email}</td>
                    <td className="py-4 px-6 text-gray-300">{lead.company || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                        {lead.source?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <p className="text-gray-400 text-lg mb-2">No leads yet</p>
            <p className="text-sm text-gray-500">Upload a CSV file to get started with AI-powered lead scoring</p>
          </div>
        )}
      </div>

      {/* CSV Format Info Modal */}
      {showFormatInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-purple-500/30 max-w-2xl w-full shadow-2xl">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">📋</span>
                  CSV Format
                </h2>
                <button
                  onClick={() => setShowFormatInfo(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-300 mb-4">Your leads CSV should include:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">*</span>
                    <p className="text-sm font-mono text-purple-300 font-semibold">Required columns:</p>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <div>
                        <span className="text-white font-semibold">email</span>
                        <span className="text-gray-400"> - Lead email</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <div>
                        <span className="text-white font-semibold">source</span>
                        <span className="text-gray-400"> - website_form, inbound_referral, paid_ads, cold_list</span>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-mono text-blue-300 font-semibold">Optional columns:</p>
                  <ul className="text-sm text-gray-300 space-y-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">name</span>
                        <span className="text-gray-400"> - Lead name</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">company</span>
                        <span className="text-gray-400"> - Company name</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">engagement_level</span>
                        <span className="text-gray-400"> - none, form_filled, email_replied, multiple_visits</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">status</span>
                        <span className="text-gray-400"> - new, contacted, qualified, converted, lost</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowFormatInfo(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
