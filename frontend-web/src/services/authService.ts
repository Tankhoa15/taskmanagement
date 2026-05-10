import api from './api'
import type { AuthResponse, ApiResponse } from '../types'

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', {
      email,
      password,
    })
    return response.data.data
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', {
      name,
      email,
      password,
    })
    return response.data.data
  },
}
