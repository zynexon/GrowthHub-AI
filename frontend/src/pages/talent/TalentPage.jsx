import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { talentService } from '../../services/talent.service'

export default function TalentPage() {
  const [view, setView] = useState('list') // list, add, edit
  const [selectedTalent, setSelectedTalent] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', skillType: 'data_labeling' })
  const [isSkillTypeOpen, setIsSkillTypeOpen] = useState(false)
  const skillTypeRef = useRef(null)
  const queryClient = useQueryClient()

  // Fetch talent list
  const { data: talentData, isLoading } = useQuery({
    queryKey: ['talent'],
    queryFn: () => talentService.getAllTalent(),
  })

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['talent-statistics'],
    queryFn: () => talentService.getStatistics(),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({ name, email, skillType }) => talentService.createTalent(name, email, skillType),
    onSuccess: () => {
      queryClient.invalidateQueries(['talent'])
      queryClient.invalidateQueries(['talent-statistics'])
      setView('list')
      resetForm()
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => talentService.updateTalent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['talent'])
      queryClient.invalidateQueries(['talent-statistics'])
      setView('list')
      resetForm()
    }
  })

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => talentService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['talent'])
      queryClient.invalidateQueries(['talent-statistics'])
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => talentService.deleteTalent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['talent'])
      queryClient.invalidateQueries(['talent-statistics'])
    }
  })

  const resetForm = () => {
    setForm({ name: '', email: '', skillType: 'data_labeling' })
    setSelectedTalent(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedTalent) {
      updateMutation.mutate({ id: selectedTalent.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (talent) => {
    setSelectedTalent(talent)
    setForm({
      name: talent.name,
      email: talent.email,
      skillType: talent.skill_type
    })
    setView('edit')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillTypeRef.current && !skillTypeRef.current.contains(event.target)) {
        setIsSkillTypeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const skillTypeOptions = [
    { value: 'data_labeling', label: 'Data Labeling', icon: '🏷️', description: 'Text classification and annotation' },
    { value: 'qa', label: 'QA', icon: '✅', description: 'Quality assurance and testing' },
    { value: 'operations', label: 'Operations', icon: '⚙️', description: 'Process management and coordination' },
    { value: 'support', label: 'Support', icon: '💬', description: 'Customer support and assistance' },
    { value: 'field_service', label: 'Field Service', icon: '🚚', description: 'On-site service delivery' }
  ]

  const selectedSkillType = skillTypeOptions.find(opt => opt.value === form.skillType)

  const getSkillIcon = (skillType) => {
    const icons = {
      data_labeling: '🏷️',
      operations: '⚙️',
      support: '💬',
      qa: '✅',
      field_service: '🚚'
    }
    return icons[skillType] || '👤'
  }

  const getSkillLabel = (skillType) => {
    const labels = {
      data_labeling: 'Data Labeling',
      operations: 'Operations',
      support: 'Support',
      qa: 'QA',
      field_service: 'Field Service'
    }
    return labels[skillType] || skillType
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-4xl">⭐</span>
            Talent
          </h1>
          {view === 'list' && (
            <button
              onClick={() => setView('add')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105"
            >
              ➕ Add Talent
            </button>
          )}
          {view !== 'list' && (
            <button
              onClick={() => { setView('list'); resetForm() }}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
            >
              ← Back to List
            </button>
          )}
        </div>
        <p className="text-gray-400">Manage people for data labeling, operations, and support tasks</p>
      </div>

      {/* Statistics Cards */}
      {view === 'list' && statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6 shadow-xl hover:border-purple-500/40 transition-all hover:scale-105">
            <p className="text-gray-400 text-sm mb-2">Total Talent</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{statsData.total_talent}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-500/30 p-6 shadow-xl hover:border-green-500/50 transition-all hover:scale-105">
            <p className="text-green-300 text-sm mb-2">Active</p>
            <p className="text-4xl font-bold text-green-400">{statsData.active_talent}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/30 p-6 shadow-xl hover:border-blue-500/50 transition-all hover:scale-105">
            <p className="text-blue-300 text-sm mb-2">Tasks Completed</p>
            <p className="text-4xl font-bold text-blue-400">{statsData.total_tasks_completed}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 p-6 shadow-xl hover:border-purple-500/50 transition-all hover:scale-105">
            <p className="text-purple-300 text-sm mb-2">Completion Rate</p>
            <p className="text-4xl font-bold text-purple-400">{statsData.overall_completion_rate}%</p>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-xl">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="text-gray-400 mt-4">Loading talent...</p>
            </div>
          ) : talentData?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Name</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Skill</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Performance</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {talentData.map((talent, index) => (
                    <tr 
                      key={talent.id} 
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-all"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSkillIcon(talent.skill_type)}</span>
                          <span className="text-white font-semibold">{talent.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{talent.email}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/50 text-sm font-semibold">
                          {getSkillLabel(talent.skill_type)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          talent.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                        }`}>
                          {talent.status === 'active' ? '✓ Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-white font-semibold mb-1">
                            {talent.tasks_completed} / {talent.tasks_assigned} tasks
                          </div>
                          <div className="text-gray-400 text-xs">
                            {talent.completion_rate}% completion
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(talent)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all hover:scale-105"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => toggleStatusMutation.mutate(talent.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                              talent.status === 'active'
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {talent.status === 'active' ? '⏸️ Disable' : '▶️ Enable'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this talent?')) {
                                deleteMutation.mutate(talent.id)
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all hover:scale-105"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-20">⭐</div>
              <p className="text-gray-400 text-lg mb-2">No talent yet</p>
              <p className="text-sm text-gray-500 mb-6">Add people to assign them work</p>
              <button
                onClick={() => setView('add')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105"
              >
                ➕ Add Your First Talent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {(view === 'add' || view === 'edit') && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-xl animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-3xl">{view === 'add' ? '➕' : '✏️'}</span>
            {view === 'add' ? 'Add New Talent' : 'Edit Talent'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-lg">👤</span>
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-lg">✉️</span>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-500"
                placeholder="john@example.com"
              />
            </div>

            <div className="relative z-20">
              <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <span className="text-lg">🏷️</span>
                Skill Type
              </label>
              
              {/* Custom Dropdown */}
              <div className="relative" ref={skillTypeRef}>
                <button
                  type="button"
                  onClick={() => setIsSkillTypeOpen(!isSkillTypeOpen)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg hover:border-gray-600 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{selectedSkillType.icon}</span>
                    <span className="font-semibold">{selectedSkillType.label}</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isSkillTypeOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isSkillTypeOpen && (
                  <div className="absolute z-[100] w-full mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden animate-fade-in-up">
                    {skillTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, skillType: option.value })
                          setIsSkillTypeOpen(false)
                        }}
                        className={`w-full px-5 py-4 text-left flex items-start gap-4 transition-all group hover:bg-gradient-to-r hover:from-purple-600/50 hover:to-blue-600/50 border-b border-gray-700/50 last:border-b-0 ${
                          form.skillType === option.value ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30' : ''
                        }`}
                      >
                        <span className="text-3xl mt-1 group-hover:scale-125 transition-transform">{option.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-white text-lg">{option.label}</p>
                            {form.skillType === option.value && (
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

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 hover:scale-105"
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? 'Saving...' 
                  : view === 'add' ? '✨ Add Talent' : '💾 Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => { setView('list'); resetForm() }}
                className="px-8 py-4 bg-gray-700 text-white rounded-xl font-bold text-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
