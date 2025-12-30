import { useState, useEffect, useRef } from 'react';
import { jobsService } from '../../services/jobs.service';
import { talentService } from '../../services/talent.service';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    jobType: '',
    description: '',
    assignedTalentId: '',
    dueDate: '',
    status: 'open'
  });
  const [isJobTypeOpen, setIsJobTypeOpen] = useState(false);
  const jobTypeRef = useRef(null);

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

  useEffect(() => {
    loadData();
  }, []);

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

      setShowForm(false);
      setSelectedJob(null);
      setFormData({
        title: '',
        jobType: '',
        description: '',
        assignedTalentId: '',
        dueDate: '',
        status: 'open'
      });
      loadData();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      jobType: job.job_type,
      description: job.description || '',
      assignedTalentId: job.assigned_talent_id || '',
      dueDate: job.due_date ? job.due_date.split('T')[0] : '',
      status: job.status
    });
    setShowForm(true);
    setShowDetail(false);
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
      setShowDetail(false);
      loadData();
    } catch (error) {
      console.error('Error marking job as completed:', error);
      alert('Failed to mark job as completed');
    }
  };

  const viewDetail = (job) => {
    setSelectedJob(job);
    setShowDetail(true);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">💼 Jobs</h1>
        <p className="text-gray-400">Simple task tracker for company work</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
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

      {/* Create Job Button */}
      <div className="flex justify-end animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <button
          onClick={() => {
            setSelectedJob(null);
            setFormData({
              title: '',
              jobType: '',
              description: '',
              assignedTalentId: '',
              dueDate: '',
              status: 'open'
            });
            setShowForm(true);
          }}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <span className="relative z-10 inline-flex items-center gap-2">
            <span className="text-xl">+</span>
            Create Job
          </span>
        </button>
      </div>

      {/* Job List Table */}
      <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.3s'}}>
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

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-blue-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-500/20 animate-scale-in">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{selectedJob ? '✏️' : '➕'}</span>
                {selectedJob ? 'Edit Job' : 'Create Job'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Type <span className="text-red-400">*</span>
                </label>
                <div className="relative" ref={jobTypeRef}>
                  <button
                    type="button"
                    onClick={() => setIsJobTypeOpen(!isJobTypeOpen)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white text-left focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    <span>
                      {formData.jobType ? (
                        <span className="flex items-center gap-2">
                          {jobTypeOptions.find(opt => opt.value === formData.jobType)?.icon}
                          {jobTypeOptions.find(opt => opt.value === formData.jobType)?.label}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select job type</span>
                      )}
                    </span>
                    <span className="text-gray-400">{isJobTypeOpen ? '▲' : '▼'}</span>
                  </button>
                  
                  {isJobTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/30 rounded-xl shadow-2xl shadow-blue-500/20 z-50 overflow-hidden">
                      {jobTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, jobType: option.value });
                            setIsJobTypeOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-500/10 transition-all border-b border-gray-700 last:border-b-0 flex items-center gap-3 group"
                        >
                          <span className="text-3xl">{option.icon}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium group-hover:text-blue-400 transition-colors flex items-center gap-2">
                              {option.label}
                              {formData.jobType === option.value && (
                                <span className="text-green-400 text-sm">✓</span>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter job description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assign Talent
                </label>
                <select
                  value={formData.assignedTalentId}
                  onChange={(e) => setFormData({ ...formData, assignedTalentId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:bg-blue-500/20 [&::-webkit-calendar-picker-indicator]:p-2 [&::-webkit-calendar-picker-indicator]:rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    📅
                  </div>
                </div>
              </div>

              {selectedJob && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                >
                  {selectedJob ? '✓ Update Job' : '+ Create Job'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all hover:scale-105"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showDetail && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-blue-500/30 max-w-2xl w-full shadow-2xl shadow-blue-500/20 animate-scale-in">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">💼</span>
                Job Details
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
                  >
                    ✓ Mark as Completed
                  </button>
                )}
                <button
                  onClick={() => handleEdit(selectedJob)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                >
                  ✏️ Edit Job
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all hover:scale-105"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
