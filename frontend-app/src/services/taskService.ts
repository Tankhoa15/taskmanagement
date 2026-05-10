import api from './api'
import type { Task, CreateTaskRequest, UpdateTaskStatusRequest } from '../types'

export const taskService = {
  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get<{ data: Task[] }>('/api/tasks/my')
    return response.data.data || []
  },

  getAssignedTasks: async (): Promise<Task[]> => {
    const response = await api.get<{ data: Task[] }>('/api/tasks/assigned')
    return response.data.data || []
  },

  getCreatedTasks: async (): Promise<Task[]> => {
    const response = await api.get<{ data: Task[] }>('/api/tasks/created')
    return response.data.data || []
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get<{ data: Task }>(`/api/tasks/${id}`)
    return response.data.data
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<{ data: Task }>('/api/tasks', data)
    return response.data.data
  },

  updateTaskStatus: async (id: string, data: UpdateTaskStatusRequest): Promise<Task> => {
    const response = await api.patch<{ data: Task }>(`/api/tasks/${id}/status`, data)
    return response.data.data
  },
}
