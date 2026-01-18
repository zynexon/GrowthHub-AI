import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { customerHealthService } from '../../services/customer-health.service'

export default function CustomersPage() {
  const [filter, setFilter] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [showFormatInfo, setShowFormatInfo] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', filter],
    queryFn: () => customerHealthService.getCustomers(filter),
  })

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    // Add user message
    const newMessages = [...chatMessages, { role: 'user', content: userMessage }]
    setChatMessages(newMessages)

    try {
      const response = await customerHealthService.chatWithCustomers(userMessage, newMessages)
      setChatMessages([...newMessages, { role: 'assistant', content: response.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setUploadProgress(10)
    setAnalyzing(false)
    
    try {
      // Simulate upload progress
      setUploadProgress(30)
      setAnalyzing(true)
      
      // Upload the file
      await customerHealthService.uploadCustomersCSV(file)
      setUploadProgress(60)
      
      // Refetch customers data
      await refetch()
      setUploadProgress(80)
      
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
    if (!confirm('Are you sure you want to delete ALL customers? This action cannot be undone.')) {
      return
    }

    try {
      await customerHealthService.clearCustomers()
      setChatMessages([])
      refetch()
      alert('All customers cleared successfully!')
    } catch (error) {
      alert('Failed to clear customers: ' + (error.response?.data?.error || error.message))
    }
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20 border-green-500/50 shadow-green-500/30'
      case 'watch': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/30'
      case 'at_risk': return 'text-red-400 bg-red-500/20 border-red-500/50 shadow-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
    }
  }

  const getRiskBadge = (churnRisk) => {
    if (!churnRisk.days) return <span className="text-gray-500 text-sm">-</span>
    
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-yellow-500/30'
    }
    
    return (
      <span className={`text-xs px-3 py-1.5 rounded-lg border font-semibold shadow-lg ${colors[churnRisk.level]}`}>
        ⚠️ {churnRisk.days}d risk
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customer Health</h1>
          <p className="text-gray-400">Monitor health scores and churn risk</p>
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
            className="flex items-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 rounded-lg font-medium hover:bg-red-600/30 hover:text-red-300 transition-all border border-red-500/50 hover:border-red-500"
            title="Clear all customers"
          >
            <span className="text-xl">🗑️</span>
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

      {/* Filter Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === null
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          All Customers
        </button>
        <button
          onClick={() => setFilter('at_risk')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'at_risk'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          🔴 At Risk
        </button>
        <button
          onClick={() => setFilter('healthy')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'healthy'
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          🟢 Healthy
        </button>
        <button
          onClick={() => setFilter('expansion')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'expansion'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📈 Expansion
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading customers...</p>
        </div>
      ) : data?.customers?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Customers Table (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden hover:border-purple-500/30 transition-all">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-gray-900/50">
                      <th className="text-left py-4 px-3 font-semibold text-gray-300">Company</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-300">Plan</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-300">MRR</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-300">Health</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-300">Status</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-300 whitespace-nowrap">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {data.customers.map((customer, index) => (
                      <tr 
                        key={customer.id} 
                        className="hover:bg-purple-500/5 transition-all duration-200 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-4 px-3">
                          <div className="group-hover:translate-x-1 transition-transform">
                            <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">{customer.company}</p>
                            <p className="text-sm text-gray-400">{customer.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span className="text-sm px-3 py-1 rounded-lg bg-gray-700/50 text-gray-300 capitalize font-medium border border-gray-600/30 whitespace-nowrap">{customer.plan}</span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="text-white font-bold whitespace-nowrap">${customer.mrr?.toLocaleString() || 0}</span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
                              {customer.health_score}
                            </span>
                            <div className="flex-1 bg-gray-700/50 rounded-full h-2 w-16 overflow-hidden border border-gray-600/30">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  customer.health_status === 'healthy' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                  customer.health_status === 'watch' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
                                  'bg-gradient-to-r from-red-500 to-pink-500'
                                }`}
                                style={{ width: `${customer.health_score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getHealthColor(customer.health_status)} shadow-lg whitespace-nowrap`}>
                            {customer.health_status === 'healthy' ? '🟢' : customer.health_status === 'watch' ? '🟡' : '🔴'}
                            {' '}{customer.health_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          {getRiskBadge(customer.churn_risk)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: AI Chatbot (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 backdrop-blur-xl rounded-2xl border-2 border-purple-500/30 overflow-hidden flex flex-col shadow-2xl shadow-purple-500/10" style={{height: '600px'}}>
                {/* Header with gradient */}
                <div className="p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-xs text-green-400 font-medium">Online</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">Ask me anything about customer health</p>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-900/20 to-gray-900/40">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 animate-fade-in">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center backdrop-blur-sm border border-purple-500/30">
                        <span className="text-5xl">💬</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">Start a conversation</h4>
                      <p className="text-sm text-gray-400 mb-4">Ask about health scores, churn risk, or expansions</p>
                      
                      <div className="space-y-2 mt-6">
                        <button 
                          onClick={() => setChatInput("Which customers are at risk of churning?")}
                          className="block w-full text-left px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-purple-600/20 hover:to-blue-600/20 rounded-xl text-sm text-gray-300 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">⚠️</span>
                            <span>Which customers are at risk of churning?</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => setChatInput("Show me customers with expansion opportunities")}
                          className="block w-full text-left px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-purple-600/20 hover:to-blue-600/20 rounded-xl text-sm text-gray-300 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">📈</span>
                            <span>Show me customers with expansion opportunities</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => setChatInput("What's our average customer health score?")}
                          className="block w-full text-left px-4 py-3 bg-gradient-to-r from-gray-800/50 to-gray-800/30 hover:from-purple-600/20 hover:to-blue-600/20 rounded-xl text-sm text-gray-300 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">💯</span>
                            <span>What's our average customer health score?</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                              : 'bg-gradient-to-br from-gray-800/80 to-gray-800/60 text-gray-100 border border-purple-500/30 backdrop-blur-sm'
                          }`}>
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-500/20">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                  <span className="text-xs">🤖</span>
                                </div>
                                <span className="text-xs font-semibold text-purple-300">AI Assistant</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start animate-fade-in">
                          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 rounded-2xl px-4 py-3 border border-purple-500/30 backdrop-blur-sm shadow-lg">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-500/20">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <span className="text-xs">🤖</span>
                              </div>
                              <span className="text-xs font-semibold text-purple-300">AI Assistant</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                              <span className="text-xs text-gray-400 ml-2">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/30 bg-gradient-to-r from-gray-900/60 to-gray-900/40 backdrop-blur-sm">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your customers..."
                      disabled={chatLoading || !data?.customers || data.customers.length === 0}
                      className="flex-1 px-4 py-3 bg-gray-800/60 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim() || !data?.customers || data.customers.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
                    >
                      {chatLoading ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <span>Send</span>
                      )}
                    </button>
                  </div>
                  {(!data?.customers || data.customers.length === 0) && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>💡</span>
                      <span>Upload customers data to start chatting with AI</span>
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20">
          <div className="text-6xl mb-4 opacity-20">👥</div>
          <p className="text-gray-400 text-lg mb-2">No customers yet</p>
          <p className="text-sm text-gray-500">Upload a CSV file to start tracking customer health</p>
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
              
              <p className="text-gray-300 mb-4">Your customers CSV should include:</p>
              
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
                        <span className="text-white font-semibold">company</span>
                        <span className="text-gray-400"> - Company name</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <div>
                        <span className="text-white font-semibold">email</span>
                        <span className="text-gray-400"> - Contact email</span>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-mono text-blue-300 font-semibold">Optional columns:</p>
                  <ul className="text-sm text-gray-300 space-y-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700 max-h-64 overflow-y-auto">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">plan</span>
                        <span className="text-gray-400"> - free, starter, pro, enterprise</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">mrr</span>
                        <span className="text-gray-400"> - Monthly recurring revenue</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">last_active</span>
                        <span className="text-gray-400"> - Last activity (YYYY-MM-DD)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">open_issues</span>
                        <span className="text-gray-400"> - Number of open issues</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">usage_tier</span>
                        <span className="text-gray-400"> - low, medium, high</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <div>
                        <span className="text-white font-semibold">team_count</span>
                        <span className="text-gray-400"> - Number of teams</span>
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

