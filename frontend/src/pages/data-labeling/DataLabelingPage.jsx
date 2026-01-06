import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataLabelingService } from '../../services/data-labeling.service'
import { stripeService } from '../../services/stripe.service'
import UpgradeModal from '../../components/UpgradeModal'

export default function DataLabelingPage() {
  const [view, setView] = useState('list') // list, upload, label
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [uploadForm, setUploadForm] = useState({ name: '', labelType: 'intent', file: null })
  const [isLabelTypeOpen, setIsLabelTypeOpen] = useState(false)
  const [showFormatInfo, setShowFormatInfo] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [limitResourceType, setLimitResourceType] = useState('datasets')
  const [currentPlan, setCurrentPlan] = useState('free')
  const labelTypeRef = useRef(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await stripeService.getSubscription()
        setCurrentPlan(data.plan_type || 'free')
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }
    fetchSubscription()
  }, [])

  const { data: datasetsData, isLoading, error } = useQuery({
    queryKey: ['labeling-datasets'],
    queryFn: () => dataLabelingService.getDatasets(),
  })

  console.log('Datasets data:', datasetsData)
  console.log('Is loading:', isLoading)
  console.log('Error:', error)

  const { data: currentRow, refetch: refetchRow } = useQuery({
    queryKey: ['labeling-row', selectedDataset?.id],
    queryFn: () => dataLabelingService.getNextRow(selectedDataset?.id),
    enabled: !!selectedDataset && view === 'label',
  })

  const uploadMutation = useMutation({
    mutationFn: ({ name, labelType, file }) => dataLabelingService.createDataset(name, labelType, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['labeling-datasets'])
      setView('list')
      setUploadForm({ name: '', labelType: 'intent', file: null })
      alert('Dataset uploaded successfully!')
    },
    onError: (error) => {
      console.error('Upload error:', error)
      if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        setLimitResourceType('datasets')
        setShowUpgradeModal(true)
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Upload failed'
        alert(`Upload failed: ${errorMsg}\n\nMake sure you've created the database tables. See DATA_LABELING_TEST.md for instructions.`)
      }
    },
  })

  const labelMutation = useMutation({
    mutationFn: ({ datasetId, rowId, label }) => dataLabelingService.labelRow(datasetId, rowId, label),
    onSuccess: () => {
      refetchRow()
      queryClient.invalidateQueries(['labeling-datasets'])
      // Update the selected dataset with fresh data
      if (selectedDataset) {
        queryClient.fetchQuery(['labeling-datasets']).then((result) => {
          const updated = result.data.datasets.find(d => d.id === selectedDataset.id)
          if (updated) setSelectedDataset(updated)
        })
      }
    },
  })

  const skipMutation = useMutation({
    mutationFn: ({ datasetId, rowId }) => dataLabelingService.skipRow(datasetId, rowId),
    onSuccess: () => {
      refetchRow()
    },
  })

  const exportMutation = useMutation({
    mutationFn: (datasetId) => dataLabelingService.exportDataset(datasetId),
    onSuccess: (response, datasetId) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dataset_${datasetId}_labeled.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: async (error) => {
      console.error('Export error:', error)
      
      // Handle blob error response (when responseType is 'blob' but server returns JSON error)
      if (error.response?.status === 403 && error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text()
          const errorData = JSON.parse(text)
          console.log('Parsed error data:', errorData)
          
          if (errorData.upgrade_required) {
            setLimitResourceType('export')
            setShowUpgradeModal(true)
            return
          }
        } catch (e) {
          console.error('Failed to parse error blob:', e)
        }
      } else if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        setLimitResourceType('export')
        setShowUpgradeModal(true)
        return
      }
      
      alert('Export failed: ' + (error.message || 'Unknown error'))
    }
  })

  const completeMutation = useMutation({
    mutationFn: (datasetId) => dataLabelingService.markCompleted(datasetId),
    onSuccess: () => {
      queryClient.invalidateQueries(['labeling-datasets'])
      alert('Dataset marked as completed!')
    },
  })

  const handleUpload = (e) => {
    e.preventDefault()
    if (!uploadForm.name || !uploadForm.labelType || !uploadForm.file) {
      alert('Please fill all fields')
      return
    }
    uploadMutation.mutate(uploadForm)
  }

  const handleLabel = (label) => {
    if (!currentRow?.data?.row) return
    labelMutation.mutate({
      datasetId: selectedDataset.id,
      rowId: currentRow.data.row.id,
      label
    })
  }

  const handleSkip = () => {
    if (!currentRow?.data?.row) return
    skipMutation.mutate({
      datasetId: selectedDataset.id,
      rowId: currentRow.data.row.id
    })
  }

  const startLabeling = (dataset) => {
    setSelectedDataset(dataset)
    setView('label')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labelTypeRef.current && !labelTypeRef.current.contains(event.target)) {
        setIsLabelTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const labelTypeOptions = [
    { value: 'intent', label: 'Intent Classification', icon: '🎯', description: 'Classify user intent or purpose' },
    { value: 'sentiment', label: 'Sentiment Analysis', icon: '😊', description: 'Analyze emotional tone' }
  ]

  const selectedLabelType = labelTypeOptions.find(opt => opt.value === uploadForm.labelType)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'not_started': return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getLabelOptions = (labelType) => {
    if (labelType === 'intent') {
      return ['Billing', 'Support', 'Cancellation', 'Sales', 'Other']
    } else if (labelType === 'sentiment') {
      return ['Positive', 'Neutral', 'Negative']
    }
    return []
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🏷️ Data Labeling</h1>
          <p className="text-gray-400">Create training datasets for text classification</p>
        </div>

        {view === 'list' && (
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
              onClick={() => setView('upload')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105"
            >
              ⬆️ Upload Dataset
            </button>
          </div>
        )}

        {view !== 'list' && (
          <button
            onClick={() => { setView('list'); setSelectedDataset(null) }}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
          >
            ← Back to Datasets
          </button>
        )}
      </div>

      {/* Upload View */}
      {view === 'upload' && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-xl animate-fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-3xl">⬆️</span>
              Upload Dataset
            </h2>
            <p className="text-gray-400">Create a new dataset for text classification labeling</p>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Dataset Name
              </label>
              <input
                type="text"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-500 hover:border-gray-600"
                placeholder="Customer Support Intents Q1"
              />
            </div>

            <div className="space-y-2 animate-fade-in-up relative z-20" style={{ animationDelay: '200ms' }}>
              <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-lg">🏷️</span>
                Label Type
              </label>
              
              {/* Custom Dropdown */}
              <div className="relative" ref={labelTypeRef}>
                <button
                  type="button"
                  onClick={() => setIsLabelTypeOpen(!isLabelTypeOpen)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg hover:border-gray-600 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{selectedLabelType.icon}</span>
                    <span className="font-semibold">{selectedLabelType.label}</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isLabelTypeOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isLabelTypeOpen && (
                  <div className="absolute z-[100] w-full mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden animate-fade-in-up">
                    {labelTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setUploadForm({ ...uploadForm, labelType: option.value })
                          setIsLabelTypeOpen(false)
                        }}
                        className={`w-full px-5 py-4 text-left flex items-start gap-4 transition-all group hover:bg-gradient-to-r hover:from-purple-600/50 hover:to-blue-600/50 border-b border-gray-700/50 last:border-b-0 ${
                          uploadForm.labelType === option.value ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30' : ''
                        }`}
                      >
                        <span className="text-3xl mt-1 group-hover:scale-125 transition-transform">{option.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-white text-lg">{option.label}</p>
                            {uploadForm.labelType === option.value && (
                              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 group-hover:text-gray-300">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 animate-fade-in-up relative z-10" style={{ animationDelay: '300ms' }}>
              <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-lg">📄</span>
                CSV File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-purple-600 file:to-blue-600 file:text-white file:font-bold file:cursor-pointer file:hover:from-purple-700 file:hover:to-blue-700 file:transition-all file:shadow-lg file:shadow-purple-500/30 hover:border-gray-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 transition-all shadow-xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 animate-fade-in-up bg-[length:200%_100%] hover:bg-[position:100%_0%]"
              style={{ animationDelay: '400ms' }}
            >
              {uploadMutation.isPending ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading Dataset...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-2xl">✨</span>
                  Create Dataset
                </span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Dataset List View */}
      {view === 'list' && (
        <>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading datasets...</p>
            </div>
          ) : datasetsData?.data?.datasets?.length > 0 ? (
            <div className="grid gap-6">
              {datasetsData.data.datasets.map((dataset, index) => (
                <div
                  key={dataset.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6 shadow-xl hover:border-purple-500/40 transition-all hover:scale-[1.02] duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-2xl">🏷️</span>
                        {dataset.name}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/50 font-semibold capitalize shadow-lg shadow-purple-500/20">
                          {dataset.label_type}
                        </span>
                        <span className={`text-sm px-3 py-1.5 rounded-lg border font-semibold capitalize shadow-lg ${getStatusColor(dataset.status)}`}>
                          {dataset.status === 'completed' && '✓ '}
                          {dataset.status === 'in_progress' && '⏳ '}
                          {dataset.status === 'not_started' && '○ '}
                          {dataset.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => startLabeling(dataset)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                      >
                        🏷️ Label
                      </button>
                      <button
                        onClick={() => exportMutation.mutate(dataset.id)}
                        disabled={dataset.labeled_count === 0 || exportMutation.isPending}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                      >
                        📥 Export
                      </button>
                      {dataset.status !== 'completed' && (
                        <button
                          onClick={() => completeMutation.mutate(dataset.id)}
                          disabled={completeMutation.isPending}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                        >
                          ✓ Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span className="font-semibold">
                        <span className="text-white text-lg">{dataset.labeled_count}</span> / {dataset.total_rows} labeled
                      </span>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {Math.round((dataset.labeled_count / dataset.total_rows) * 100)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-700/50 rounded-full h-4 overflow-hidden border border-gray-600/30 shadow-inner">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 transition-all duration-700 ease-out rounded-full shadow-lg"
                        style={{ 
                          width: `${(dataset.labeled_count / dataset.total_rows) * 100}%`,
                          backgroundSize: '200% 100%',
                          animation: 'gradient-shift 3s ease infinite'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all hover:scale-105 duration-300">
                      <p className="text-gray-400 mb-1 text-xs">Total Rows</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{dataset.total_rows}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 duration-300">
                      <p className="text-green-300 mb-1 text-xs">Labeled</p>
                      <p className="text-3xl font-bold text-green-400">{dataset.labeled_count}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all hover:scale-105 duration-300">
                      <p className="text-yellow-300 mb-1 text-xs">Skipped</p>
                      <p className="text-3xl font-bold text-yellow-400">{dataset.skipped_count || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20">
              <div className="text-6xl mb-4 opacity-20">🏷️</div>
              <p className="text-gray-400 text-lg mb-2">No datasets yet</p>
              <p className="text-sm text-gray-500">Upload a CSV file to create your first dataset</p>
            </div>
          )}
        </>
      )}

      {/* Labeling View */}
      {view === 'label' && selectedDataset && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-xl animate-fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center gap-3">
              <span className="text-3xl">🏷️</span>
              {selectedDataset.name}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/50 font-semibold capitalize shadow-lg shadow-purple-500/20">
                {selectedDataset.label_type}
              </span>
              <span className="text-gray-300 font-semibold">
                <span className="text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{selectedDataset.labeled_count}</span>
                <span className="text-gray-400"> / {selectedDataset.total_rows} completed</span>
              </span>
            </div>
          </div>

          {currentRow?.data?.row ? (
            <div className="space-y-8 animate-fade-in-up">
              {/* Text to Label */}
              <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-8 border border-gray-700/50 shadow-xl hover:border-purple-500/30 transition-all">
                <p className="text-sm font-semibold text-purple-400 mb-3">Text to Label</p>
                <p className="text-2xl text-white leading-relaxed font-medium">{currentRow.data.row.text}</p>
              </div>

              {/* Label Options */}
              <div>
                <p className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <span className="text-xl">👆</span>
                  Select {selectedDataset.label_type}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getLabelOptions(selectedDataset.label_type).map((option, index) => (
                    <button
                      key={option}
                      onClick={() => handleLabel(option)}
                      disabled={labelMutation.isPending}
                      className="group px-8 py-5 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white font-bold text-lg hover:from-purple-600 hover:to-blue-600 hover:border-purple-500 transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="group-hover:scale-110 inline-block transition-transform">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSkip}
                  disabled={skipMutation.isPending}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-500 transition-all disabled:opacity-50 shadow-lg hover:shadow-gray-500/30 hover:scale-105 active:scale-95"
                >
                  ⏭️ Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="text-8xl mb-6 animate-bounce">✅</div>
              <h3 className="text-3xl font-bold text-white mb-3">All rows labeled!</h3>
              <p className="text-lg text-gray-400 mb-8">Great work! Export your labeled data or mark this dataset as completed.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => exportMutation.mutate(selectedDataset.id)}
                  disabled={exportMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all shadow-lg shadow-green-500/50 hover:scale-105 disabled:opacity-50"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => completeMutation.mutate(selectedDataset.id)}
                  disabled={completeMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105 disabled:opacity-50"
                >
                  ✓ Mark Completed
                </button>
              </div>
            </div>
          )}
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
              
              <p className="text-gray-300 mb-4">Your dataset CSV must include:</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">*</span>
                  <p className="text-sm font-mono text-purple-300 font-semibold">Required columns:</p>
                </div>
                <ul className="text-sm text-gray-300 space-y-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <div>
                      <span className="text-white font-semibold">id</span>
                      <span className="text-gray-400"> - Unique identifier for each row</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <div>
                      <span className="text-white font-semibold">text</span>
                      <span className="text-gray-400"> - The text content to be labeled</span>
                    </div>
                  </li>
                </ul>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mt-4">
                  <p className="text-sm text-gray-300 mb-2 font-semibold">Example CSV:</p>
                  <code className="text-xs font-mono text-purple-300 bg-gray-900/70 px-3 py-2 rounded block border border-purple-500/20">
                    id,text<br />
                    1,"Technical support is not responding"<br />
                    2,"How do I reset my password?"<br />
                    3,"Your product is amazing!"
                  </code>
                </div>

                <div className="flex items-start gap-2 text-sm text-blue-300 bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 mt-4">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Each row will be presented for labeling one at a time in the labeling interface.</span>
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

      {/* Upgrade Modal */}
      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resourceType={limitResourceType}
        currentPlan={currentPlan}
      />
    </div>
  )
}
