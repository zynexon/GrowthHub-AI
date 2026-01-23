import { useState, useEffect, useRef } from 'react';
import { jobsService } from '../../services/jobs.service';
import { talentService } from '../../services/talent.service';
import { stripeService } from '../../services/stripe.service';
import UpgradeModal from '../../components/UpgradeModal';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, add, edit, detail
  const [selectedJob, setSelectedJob] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [formData, setFormData] = useState({
    title: '',
    jobType: '',
    requiredSkill: '',
    description: '',
    assignedTalentId: '',
    dueDate: '',
    status: 'open'
  });
  const [isRequiredSkillOpen, setIsRequiredSkillOpen] = useState(false);
  const requiredSkillRef = useRef(null);

  const jobTypeOptions = [
    {
      value: 'data_labeling',
      label: 'Data Labeling',
      icon: '🏷️',
      description: 'Label and annotate datasets'
    },
    {
      value: 'operations',
      label: 'Operations',
      icon: '⚙️',
      description: 'Internal operations tasks'
    },
    {
      value: 'service',
      label: 'Service',
      icon: '🚚',
      description: 'Customer service work'
    }
  ];

  const skillTypeOptions = [
    {
      value: 'data_labeling',
      label: 'Data Labeling',
      icon: '🏷️',
      description: 'Dataset labeling and annotation'
    },
    {
      value: 'operations',
      label: 'Operations',
      icon: '⚙️',
      description: 'Business operations tasks'
    },
    {
      value: 'support',
      label: 'Support',
      icon: '🎧',
      description: 'Customer support services'
    },
    {
      value: 'qa',
      label: 'QA',
      icon: '✅',
      description: 'Quality assurance testing'
    },
    {
      value: 'field_service',
      label: 'Field Service',
      icon: '🚚',
      description: 'On-site field services'
    }
  ];

  useEffect(() => {
    loadData();
    fetchSubscription();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (requiredSkillRef.current && !requiredSkillRef.current.contains(event.target)) {
        setIsRequiredSkillOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await stripeService.getSubscription();
      setCurrentPlan(data.plan_type || 'free');
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (jobTypeRef.current && !jobTypeRef.current.contains(event.target)) {
        setIsJobTypeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, statsData, talentsData] = await Promise.all([
        jobsService.getAllJobs(),
        jobsService.getStatistics(),
        talentService.getAllTalent()
      ]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setStatistics(statsData);
      setTalents(Array.isArray(talentsData) ? talentsData.filter(t => t.status === 'active') : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setJobs([]);
      setTalents([]);
      setStatistics({ total_jobs: 0, open_jobs: 0, in_progress_jobs: 0, completed_jobs: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        jobType: formData.jobType,
        description: formData.description,
        assignedTalentId: formData.assignedTalentId || null,
        dueDate: formData.dueDate || null,
        status: formData.status
      };

      if (selectedJob) {
        await jobsService.updateJob(selectedJob.id, payload);
      } else {
        await jobsService.createJob(payload);
      }

      setView('list');
      setSelectedJob(null);
      setFormData({
        title: '',
        jobType: '',
        requiredSkill: '',
        description: '',
        assignedTalentId: '',
        dueDate: '',
        status: 'open'
      });
      loadData();
    } catch (error) {
      console.error('Error saving job:', error);
      if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
        setShowUpgradeModal(true);
      } else {
        alert('Failed to save job');
      }
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      jobType: job.job_type,
      requiredSkill: job.required_skill || '',
      description: job.description || '',
      assignedTalentId: job.assigned_talent_id || '',
      dueDate: job.due_date ? job.due_date.split('T')[0] : '',
      status: job.status
    });
    setView('edit');
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsService.deleteJob(jobId);
      loadData();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  const handleMarkCompleted = async (jobId) => {
    try {
      await jobsService.markCompleted(jobId);
      setView('list');
      loadData();
    } catch (error) {
      console.error('Error marking job as completed:', error);
      alert('Failed to mark job as completed');
    }
  };

  const viewDetail = (job) => {
    setSelectedJob(job);
    setView('detail');
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/30 shadow-lg shadow-gray-500/10',
      in_progress: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 shadow-lg shadow-yellow-500/10',
      completed: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 shadow-lg shadow-green-500/10'
    };
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed'
    };
    const icons = {
      open: '○',
      in_progress: '◐',
      completed: '●'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]} inline-flex items-center gap-1.5`}>
        <span>{icons[status]}</span>
        {labels[status]}
      </span>
    );
  };

  const getJobTypeDisplay = (jobType) => {
    const option = jobTypeOptions.find(opt => opt.value === jobType);
    if (!option) return jobType;
    return (
      <span className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
        <span className="text-xl">{option.icon}</span>
        <span className="font-medium">{option.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-pulse">💼</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">💼</span>
            Jobs
          </h1>
          <p className="text-gray-400">Simple task tracker for company work</p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => {
              setSelectedJob(null);
              setFormData({
                title: '',
                jobType: '',
                requiredSkill: '',
                description: '',
                assignedTalentId: '',
                dueDate: '',
                status: 'open'
              });
              setView('add');
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105"
          >
            ➕ Create Job
          </button>
        )}
        {view !== 'list' && (
          <button
            onClick={() => { setView('list'); setSelectedJob(null); }}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* Statistics Cards - Only show in list view */}
      {view === 'list' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-2">
                <span>📊</span>
                Total Jobs
              </div>
              <div className="text-3xl font-bold text-white">{statistics.total_jobs}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/20 backdrop-blur-lg rounded-xl p-6 border border-gray-500/20 hover:border-gray-500/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-gray-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
                <span>○</span>
                Open
              </div>
              <div className="text-3xl font-bold text-white">{statistics.open_jobs}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-yellow-400 text-sm font-medium mb-2 flex items-center gap-2">
                <span>◐</span>
                In Progress
              </div>
              <div className="text-3xl font-bold text-white">{statistics.in_progress_jobs}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
                <span>●</span>
                Completed
              </div>
              <div className="text-3xl font-bold text-white">{statistics.completed_jobs}</div>
            </div>
          </div>
        </div>
      )}

      {/* Job List - Only show in list view */}
      {view === 'list' && (
      <>
      {/* Job List - Desktop Table View */}
      <div className="hidden lg:block bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.3s'}}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800/50 to-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Job</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                      <div className="text-6xl opacity-50 animate-float">💼</div>
                      <div className="text-gray-400">No jobs yet. Create your first job to get started!</div>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => (
                  <tr 
                    key={job.id} 
                    className="hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 transition-all animate-fade-in-up"
                    style={{animationDelay: `${0.4 + index * 0.05}s`}}
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{job.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">{getJobTypeDisplay(job.job_type)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {job.talent ? (
                        <div>
                          <div className="text-white">{job.talent.name}</div>
                          <div className="text-xs text-gray-400">{job.talent.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {job.due_date ? (
                        <span className="text-gray-300">
                          {new Date(job.due_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">No deadline</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDetail(job)}
                          className="group px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-400 rounded-lg hover:from-blue-600/30 hover:to-blue-700/30 transition-all text-sm font-medium border border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span>👁️</span>
                            View
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(job)}
                          className="group px-3 py-1.5 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 rounded-lg hover:from-green-600/30 hover:to-emerald-600/30 transition-all text-sm font-medium border border-green-500/20 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/20"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span>✏️</span>
                            Edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="group px-3 py-1.5 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 rounded-lg hover:from-red-600/30 hover:to-red-700/30 transition-all text-sm font-medium border border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/20"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span>🗑️</span>
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job List - Mobile Card View */}
      <div className="lg:hidden space-y-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
        {jobs.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 p-12 text-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="text-6xl opacity-50 animate-float">💼</div>
              <div className="text-gray-400">No jobs yet. Create your first job to get started!</div>
            </div>
          </div>
        ) : (
          jobs.map((job, index) => (
            <div 
              key={job.id}
              className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 hover:border-purple-500/30 transition-all animate-fade-in-up"
              style={{animationDelay: `${0.4 + index * 0.05}s`}}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-semibold text-lg flex-1">{job.title}</h3>
                  {getStatusBadge(job.status)}
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  {getJobTypeDisplay(job.job_type)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Assigned:</span>
                    {job.talent ? (
                      <div className="text-white">
                        {job.talent.name}
                        <span className="text-gray-400 text-xs ml-1">({job.talent.email})</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </div>
                  
                  {job.due_date && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Due:</span>
                      <span className="text-white">{new Date(job.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => viewDetail(job)}
                    className="flex-1 min-w-[100px] px-3 py-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-400 rounded-lg hover:from-blue-600/30 hover:to-blue-700/30 transition-all text-sm font-medium border border-blue-500/20"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex-1 min-w-[100px] px-3 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 rounded-lg hover:from-green-600/30 hover:to-emerald-600/30 transition-all text-sm font-medium border border-green-500/20"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 rounded-lg hover:from-red-600/30 hover:to-red-700/30 transition-all text-sm font-medium border border-red-500/20"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </>
      )}

      {/* Create/Edit Form - Full Page */}
      {(view === 'add' || view === 'edit') && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-xl animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-3xl">{view === 'edit' ? '✏️' : '➕'}</span>
            {view === 'edit' ? 'Edit Job' : 'Create New Job'}
          </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-500"
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  Job Type <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-500"
                  placeholder="e.g., Data Labeling, Operations, Service"
                />
              </div>

              <div className="relative z-10">
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  Required Skill <span className="text-red-400">*</span>
                </label>
                <div className="relative" ref={requiredSkillRef}>
                  <button
                    type="button"
                    onClick={() => setIsRequiredSkillOpen(!isRequiredSkillOpen)}
                    className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg hover:border-gray-600 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {formData.requiredSkill ? (
                        <>
                          <span className="text-2xl group-hover:scale-110 transition-transform">
                            {skillTypeOptions.find(opt => opt.value === formData.requiredSkill)?.icon}
                          </span>
                          <span className="font-semibold">{skillTypeOptions.find(opt => opt.value === formData.requiredSkill)?.label}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Select required skill</span>
                      )}
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isRequiredSkillOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isRequiredSkillOpen && (
                    <div className="absolute z-[100] w-full mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500/50 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden animate-fade-in-up">
                      {skillTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, requiredSkill: option.value });
                            setIsRequiredSkillOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-purple-500/10 transition-all border-b border-gray-700 last:border-b-0 flex items-center gap-3 group"
                        >
                          <span className="text-3xl group-hover:scale-110 transition-transform">{option.icon}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium group-hover:text-purple-400 transition-colors flex items-center gap-2">
                              {option.label}
                              {formData.requiredSkill === option.value && (
                                <span className="text-green-400 text-lg">✓</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Description <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all placeholder-gray-500 resize-none"
                  placeholder="Describe what needs to be done..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  Assign Talent <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                </label>
                <select
                  value={formData.assignedTalentId}
                  onChange={(e) => setFormData({ ...formData, assignedTalentId: e.target.value })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all"
                >
                  <option value="">Unassigned</option>
                  {talents.map((talent) => (
                    <option key={talent.id} value={talent.id}>
                      {talent.name} ({talent.skill_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Due Date <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {selectedJob && (
                <div>
                  <label className="block text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl text-white text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 transition-all"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 hover:scale-105"
                >
                  {selectedJob ? '✓ Update Job' : '➕ Create Job'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setSelectedJob(null);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all hover:scale-105"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
        </div>
      )}

      {/* Job Detail - Full Page */}
      {view === 'detail' && selectedJob && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-blue-500/20 p-8 shadow-xl animate-fade-in-up">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-3xl">💼</span>
            Job Details
          </h2>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Title</div>
                <div className="text-xl font-bold text-white">{selectedJob.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Type</div>
                  <div className="text-white">{getJobTypeDisplay(selectedJob.job_type)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div>{getStatusBadge(selectedJob.status)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">Description</div>
                <div className="text-white whitespace-pre-wrap">
                  {selectedJob.description || 'No description provided'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Assigned To</div>
                  {selectedJob.talent ? (
                    <div>
                      <div className="text-white font-medium">{selectedJob.talent.name}</div>
                      <div className="text-sm text-gray-400">{selectedJob.talent.email}</div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Unassigned</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Due Date</div>
                  <div className="text-white">
                    {selectedJob.due_date
                      ? new Date(selectedJob.due_date).toLocaleDateString()
                      : 'No deadline'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {selectedJob.status !== 'completed' && (
                  <button
                    onClick={() => handleMarkCompleted(selectedJob.id)}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 hover:scale-105"
                  >
                    ✓ Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => handleEdit(selectedJob)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:scale-105"
                >
                  ✏️ Edit Job
                </button>
                <button
                  onClick={() => setView('list')}
                  className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all hover:scale-105"
                >
                  ✕ Close
                </button>
              </div>
            </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resourceType="jobs"
        currentPlan={currentPlan}
      />
    </div>
  );
}
