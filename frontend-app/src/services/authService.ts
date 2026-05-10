import * as Google from 'expo-google-app-auth'
import * as SecureStore from 'expo-secure-store'
import api from './api'
import type { AuthResponse } from '../types'

const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'

export const authService = {
  loginWithGoogle: async (): Promise<AuthResponse> => {
    try {
      const result = await Google.logInAsync({
        iosClientId: GOOGLE_CLIENT_ID,
        androidClientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
      })

      if (result.type === 'success') {
        // Send the ID token to backend to verify and get JWT
        const response = await api.post<{ data: AuthResponse }>('/api/auth/google', {
          googleToken: result.idToken,
        })
        
        // Store token securely
        await SecureStore.setItemAsync('token', response.data.data.accessToken)
        
        return response.data.data
      } else {
        throw new Error('Google login cancelled')
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  },
}
