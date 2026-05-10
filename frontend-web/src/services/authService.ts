import api from './api'
import type { AuthResponse, ApiResponse } from '../types'

export const authService = {
  loginWithGoogle: async (googleToken: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/google', {
      googleToken,
    })
    return response.data.data
  },
}
