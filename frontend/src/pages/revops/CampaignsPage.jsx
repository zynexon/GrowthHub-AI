import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { revopsService } from '../../services/revops.service'

export default function CampaignsPage() {
  const [uploadingFile, setUploadingFile] = useState(false)

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
        
        <label className="group btn-primary cursor-pointer flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105 hover:shadow-purple-500/70">
          <span className="text-lg">⬆️</span>
          {uploadingFile ? 'Uploading...' : 'Upload Campaigns CSV'}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploadingFile}
          />
        </label>
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

      {/* CSV Format Help */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">📋 CSV Format</h3>
        <p className="text-gray-400 mb-3">Your campaigns CSV should include:</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-mono text-purple-300 mb-2">Required columns:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <span className="text-white">name</span> - Campaign name</li>
              <li>• <span className="text-white">channel</span> - email, paid_ads, social, etc.</li>
              <li>• <span className="text-white">spend</span> - Amount spent (numeric)</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-mono text-purple-300 mb-2">Optional columns:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <span className="text-white">period</span> - Q1-2025, Jan-2025, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
