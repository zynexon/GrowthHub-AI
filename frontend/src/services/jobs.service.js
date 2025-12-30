import api from './api'

export const jobsService = {
  // Get all jobs
  getAllJobs: async () => {
    const response = await api.get('/jobs')
    return response.data.jobs || []
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/jobs/statistics')
    return response.data
  },

  // Get single job
  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`)
    return response.data.job
  },

  // Create job
  createJob: async (data) => {
    const response = await api.post('/jobs', {
      title: data.title,
      job_type: data.jobType,
      description: data.description,
      assigned_talent_id: data.assignedTalentId || null,
      due_date: data.dueDate || null
    })
    return response.data
  },

  // Update job
  updateJob: async (id, data) => {
    const response = await api.put(`/jobs/${id}`, {
      title: data.title,
      job_type: data.jobType,
      description: data.description,
      assigned_talent_id: data.assignedTalentId || null,
      due_date: data.dueDate || null,
      status: data.status
    })
    return response.data
  },

  // Mark completed
  markCompleted: async (id) => {
    const response = await api.patch(`/jobs/${id}/complete`)
    return response.data
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`)
    return response.data
  }
}
