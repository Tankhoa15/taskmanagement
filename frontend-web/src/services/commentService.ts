import api from './api'
import type { ApiResponse, Comment } from '../types'

export const commentService = {
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get<ApiResponse<Comment[]>>(`/api/tasks/${taskId}/comments`)
    return response.data.data || []
  },

  addComment: async (taskId: string, content: string): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(`/api/tasks/${taskId}/comments`, { content })
    return response.data.data
  },
}
