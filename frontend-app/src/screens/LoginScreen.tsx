import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as Google from 'expo-google-app-auth'
import { useAuthStore } from '../store/authStore'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      
      const result = await Google.logInAsync({
        iosClientId: 'your-ios-client-id.apps.googleusercontent.com',
        androidClientId: 'your-android-client-id.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      })

      if (result.type === 'success') {
        // In production, send the ID token to backend
        // For demo, we'll create a mock response
        await login({
          accessToken: result.idToken || '',
          tokenType: 'Bearer',
          expiresIn: 3600,
          email: result.user.email || '',
          name: result.user.name || '',
          pictureUrl: result.user.photoUrl || '',
        })
      } else {
        Alert.alert('Error', 'Login was cancelled')
      }
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert('Error', 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Task Manager</Text>
          <Text style={styles.subtitle}>Quản lý công việc hiệu quả</Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <Text style={styles.link}>Điều khoản sử dụng</Text>
          {' '}và{' '}
          <Text style={styles.link}>Chính sách bảo mật</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  terms: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 24,
    fontSize: 12,
  },
  link: {
    textDecorationLine: 'underline',
  },
})
