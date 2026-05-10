import api from './api'
import type { User } from '../types'

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ data: User }>('/api/users/me')
    return response.data.data
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<{ data: User[] }>('/api/users')
    return response.data.data || []
  },
}
