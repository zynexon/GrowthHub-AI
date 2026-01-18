import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { revopsService } from '../../services/revops.service'

export default function CampaignsPage() {
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [showFormatInfo, setShowFormatInfo] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => revopsService.getCampaigns(),
  })

  // Fetch AI analysis when campaigns data is available
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (data?.campaigns && data.campaigns.length > 0 && !aiSummary && !loadingAnalysis) {
        try {
          console.log('[CampaignsPage] Auto-fetching AI analysis...')
          setLoadingAnalysis(true)
          const summary = await revopsService.analyzeCampaigns()
          console.log('[CampaignsPage] AI analysis loaded:', summary)
          setAiSummary(summary)
        } catch (error) {
          console.error('[CampaignsPage] Failed to fetch AI analysis:', error)
        } finally {
          setLoadingAnalysis(false)
        }
      }
    }
    fetchAnalysis()
  }, [data?.campaigns])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setUploadProgress(10)
    setAnalyzing(false)
    setAiSummary(null)
    
    try {
      // Simulate upload progress
      setUploadProgress(30)
      setAnalyzing(true)
      
      // Upload the file
      await revopsService.uploadCampaignsCSV(file)
      setUploadProgress(60)
      
      // Refetch campaigns data
      await refetch()
      setUploadProgress(80)
      
      // Get AI analysis
      try {
        console.log('[CampaignsPage] Fetching AI analysis...')
        setLoadingAnalysis(true)
        const summary = await revopsService.analyzeCampaigns()
        console.log('[CampaignsPage] AI analysis response:', summary)
        setAiSummary(summary)
      } catch (error) {
        console.error('[CampaignsPage] AI analysis failed:', error)
      } finally {
        setLoadingAnalysis(false)
      }
      
      setUploadProgress(100)
      setAnalyzing(false)
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(0)
      }, 2000)
      
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.error || error.message))
      setAnalyzing(false)
      setUploadProgress(0)
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
      setAiSummary(null)
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

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              {analyzing ? '🤖 Analyzing data with AI...' : '⬆️ Uploading...'}
            </span>
            <span className="text-purple-300 font-semibold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading campaigns...</p>
        </div>
      ) : data?.campaigns?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Campaigns Grid (2 columns) */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Right: AI Summary (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 overflow-hidden">
                <div className="p-6 border-b border-purple-500/20 bg-purple-900/20">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    AI Analysis
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Insights from your campaign data</p>
                </div>

                {loadingAnalysis ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-300 font-medium">Analyzing with AI...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                ) : aiSummary ? (
                  <div className="p-6 space-y-4">
                    {/* Total Campaigns */}
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-sm text-gray-400 mb-1">Total Campaigns</div>
                      <div className="text-3xl font-bold text-white">{aiSummary.total_campaigns}</div>
                    </div>

                    {/* Performance Distribution */}
                    {aiSummary.performance_distribution && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-400">Performance Distribution</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <div className="text-green-400 text-xs mb-1">🚀 Excellent</div>
                            <div className="text-2xl font-bold text-white">{aiSummary.performance_distribution.excellent || 0}</div>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <div className="text-blue-400 text-xs mb-1">✅ Good</div>
                            <div className="text-2xl font-bold text-white">{aiSummary.performance_distribution.good || 0}</div>
                          </div>
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <div className="text-yellow-400 text-xs mb-1">⚖️ Break-even</div>
                            <div className="text-2xl font-bold text-white">{aiSummary.performance_distribution.break_even || 0}</div>
                          </div>
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <div className="text-red-400 text-xs mb-1">⚠️ Loss</div>
                            <div className="text-2xl font-bold text-white">{aiSummary.performance_distribution.loss || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Insights */}
                    {aiSummary.insights && aiSummary.insights.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-400">💡 Key Insights</h4>
                        <ul className="space-y-2">
                          {aiSummary.insights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2 bg-gray-800/30 p-3 rounded-lg border border-gray-700">
                              <span className="text-purple-400 mt-0.5">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-400">🎯 Recommendations</h4>
                        <ul className="space-y-2">
                          {aiSummary.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2 bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-4 opacity-20">🤖</div>
                    <p className="text-gray-400">Upload campaigns to see AI-powered insights</p>
                    <p className="text-sm text-gray-500 mt-2">Analysis includes performance distribution, ROI trends, and recommendations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-purple-500/30 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-lg">
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
                        <span className="text-white font-semibold">period</span>
                        <span className="text-gray-400"> - Time period (Q1 2024)</span>
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
