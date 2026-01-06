import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { revopsService } from '../../services/revops.service'

export default function CampaignsPage() {
  const [uploadingFile, setUploadingFile] = useState(false)
  const [showFormatInfo, setShowFormatInfo] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => revopsService.getCampaigns(),
  })

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      await revopsService.uploadCampaignsCSV(file)
      refetch()
      alert('Campaigns uploaded successfully!')
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete ALL campaigns? This action cannot be undone.')) {
      return
    }
    
    try {
      await revopsService.clearCampaigns()
      refetch()
      alert('All campaigns cleared successfully!')
    } catch (error) {
      alert('Failed to clear campaigns: ' + (error.response?.data?.error || error.message))
    }
  }

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'good': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'break-even': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'loss': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getPerformanceIcon = (performance) => {
    switch (performance) {
      case 'excellent': return '🚀'
      case 'good': return '✅'
      case 'break-even': return '⚖️'
      case 'loss': return '⚠️'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Campaigns & ROI</h1>
          <p className="text-gray-400">Track campaign performance and return on investment</p>
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

          <button
            onClick={handleClearData}
            className="flex items-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 rounded-lg font-medium hover:bg-red-600/30 hover:text-red-300 transition-all border border-red-500/30 hover:border-red-500/50"
            title="Clear all campaigns"
          >
            <span className="text-lg">🗑️</span>
            <span>Clear Data</span>
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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading campaigns...</p>
        </div>
      ) : data?.campaigns?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.campaigns.map((campaign, index) => (
            <div
              key={campaign.id}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {campaign.channel} {campaign.period ? `• ${campaign.period}` : ''}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(campaign.performance)}`}>
                  {getPerformanceIcon(campaign.performance)} {campaign.performance}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Spend</span>
                  <span className="text-white font-semibold">${campaign.spend?.toLocaleString() || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Revenue</span>
                  <span className="text-green-400 font-semibold">${campaign.revenue?.toLocaleString() || 0}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">ROI</span>
                  <span className={`text-xl font-bold ${
                    parseFloat(campaign.roi_percentage) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {campaign.roi_percentage || '0%'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20">
          <div className="text-6xl mb-4 opacity-20">📊</div>
          <p className="text-gray-400 text-lg mb-2">No campaigns yet</p>
          <p className="text-sm text-gray-500">Upload a CSV file to track campaign ROI</p>
        </div>
      )}

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
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-blue-300 text-sm font-medium">📄 Format: CSV (UTF-8, comma-delimited)</p>
              </div>
              
              <p className="text-gray-300 mb-4">Your campaigns CSV should include:</p>
              
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
                        <span className="text-white font-semibold">name</span>
                        <span className="text-gray-400"> - Campaign name</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <div>
                        <span className="text-white font-semibold">spend</span>
                        <span className="text-gray-400"> - Amount spent (numeric)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <div>
                        <span className="text-white font-semibold">revenue</span>
                        <span className="text-gray-400"> - Revenue generated (numeric)</span>
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
                        <span className="text-white font-semibold">channel</span>
                        <span className="text-gray-400"> - email, paid_ads, social, etc.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">start_date</span>
                        <span className="text-gray-400"> - Campaign start (YYYY-MM-DD)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">end_date</span>
                        <span className="text-gray-400"> - Campaign end (YYYY-MM-DD)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">lead_count</span>
                        <span className="text-gray-400"> - Number of leads generated</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">conversion_count</span>
                        <span className="text-gray-400"> - Number of conversions</span>
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
