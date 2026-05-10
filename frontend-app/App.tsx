import React, { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuthStore } from './src/store/authStore'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  return <AppNavigator />
}
