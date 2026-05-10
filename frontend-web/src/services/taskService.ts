import api from './api'
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskStatusRequest, ApiResponse } from '../types'

export const taskService = {
  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>('/api/tasks/my')
    return response.data.data || []
  },

  getAssignedTasks: async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>('/api/tasks/assigned')
    return response.data.data || []
  },

  getCreatedTasks: async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>('/api/tasks/created')
    return response.data.data || []
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/api/tasks/${id}`)
    return response.data.data
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>('/api/tasks', data)
    return response.data.data
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/api/tasks/${id}`, data)
    return response.data.data
  },

  updateTaskStatus: async (id: string, data: UpdateTaskStatusRequest): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(`/api/tasks/${id}/status`, data)
    return response.data.data
  },

  assignTask: async (taskId: string, assigneeId: string): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(
      `/api/tasks/${taskId}/assign?assigneeId=${assigneeId}`
    )
    return response.data.data
  },
}
