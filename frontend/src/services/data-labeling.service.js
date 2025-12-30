import api from './api'

export const dataLabelingService = {
  // Get all datasets
  getDatasets: () => api.get('/data-labeling/datasets'),

  // Get single dataset
  getDataset: (datasetId) => api.get(`/data-labeling/datasets/${datasetId}`),

  // Create dataset with CSV upload
  createDataset: (name, labelType, file) => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('label_type', labelType)
    formData.append('file', file)
    
    return api.post('/data-labeling/datasets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Get next unlabeled row
  getNextRow: (datasetId) => api.get(`/data-labeling/datasets/${datasetId}/next`),

  // Label a row
  labelRow: (datasetId, rowId, label) =>
    api.post(`/data-labeling/datasets/${datasetId}/label`, { row_id: rowId, label }),

  // Skip a row
  skipRow: (datasetId, rowId) =>
    api.post(`/data-labeling/datasets/${datasetId}/skip`, { row_id: rowId }),

  // Export labeled data
  exportDataset: (datasetId) =>
    api.get(`/data-labeling/datasets/${datasetId}/export`, {
      responseType: 'blob'
    }),

  // Mark dataset as completed
  markCompleted: (datasetId) =>
    api.post(`/data-labeling/datasets/${datasetId}/complete`)
}
