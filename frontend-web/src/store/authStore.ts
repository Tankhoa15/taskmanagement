import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (authData: AuthResponse) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (authData: AuthResponse) => {
        set({
          token: authData.accessToken,
          isAuthenticated: true,
          user: {
            id: authData.userId,
            email: authData.email,
            name: authData.name,
            pictureUrl: authData.pictureUrl,
            role: authData.role,
            enabled: true,
            createdAt: new Date().toISOString(),
          },
        })
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      updateUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
