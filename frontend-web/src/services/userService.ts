import api from './api'
import type { User, ApiResponse } from '../types'

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/api/users/me')
    return response.data.data
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/api/users/${id}`)
    return response.data.data
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/api/users')
    return response.data.data || []
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/api/users/email/${email}`)
    return response.data.data
  },

  setUserEnabled: async (userId: string, enabled: boolean): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/api/users/${userId}/enabled`, { enabled })
    return response.data.data
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/api/users/${userId}/role`, { role })
    return response.data.data
  },

  deleteSelf: async (): Promise<void> => {
    await api.delete('/api/users/me')
  },
}
