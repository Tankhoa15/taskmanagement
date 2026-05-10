import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import type { User, AuthResponse } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (authData: AuthResponse) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (authData: AuthResponse) => {
    try {
      await AsyncStorage.setItem('token', authData.accessToken)
      const userData = {
        id: '',
        email: authData.email,
        name: authData.name,
        pictureUrl: authData.pictureUrl,
        role: 'USER',
        enabled: true,
        createdAt: new Date().toISOString(),
      }
      await AsyncStorage.setItem('user', JSON.stringify(userData))
      set({
        token: authData.accessToken,
        isAuthenticated: true,
        user: userData as User,
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  updateUser: (user: User) => set({ user }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const userStr = await AsyncStorage.getItem('user')
      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Check auth error:', error)
      set({ isLoading: false })
    }
  },
}))
