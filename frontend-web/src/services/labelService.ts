import api from './api'
import type { ApiResponse, Label } from '../types'

export const labelService = {
  getAllLabels: async (): Promise<Label[]> => {
    const response = await api.get<ApiResponse<Label[]>>('/api/labels')
    return response.data.data || []
  },

  createLabel: async (name: string, color: string): Promise<Label> => {
    const response = await api.post<ApiResponse<Label>>('/api/labels', { name, color })
    return response.data.data
  },

  deleteLabel: async (id: string): Promise<void> => {
    await api.delete(`/api/labels/${id}`)
  },

  updateTaskLabels: async (taskId: string, labelIds: string[]): Promise<void> => {
    await api.patch(`/api/tasks/${taskId}/labels`, { labelIds })
  },
}
