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
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuthStore()

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (isRegistering && !name.trim())) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin.')
      return
    }

    if (isRegistering && password.length < 8) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu cần tối thiểu 8 ký tự.')
      return
    }

    try {
      setLoading(true)

      const authResponse = isRegistering
        ? await authService.register(name, email, password)
        : await authService.login(email, password)

      await login(authResponse)
    } catch (error) {
      console.error('Login error:', error)
      Alert.alert('Lỗi', isRegistering ? 'Đăng ký thất bại. Vui lòng thử lại.' : 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.')
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
          <Text style={styles.subtitle}>
            {isRegistering ? 'Tạo tài khoản nội bộ' : 'Đăng nhập bằng email và mật khẩu'}
          </Text>
        </View>

        <View style={styles.form}>
          {isRegistering && (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tên hiển thị"
              autoCapitalize="words"
              editable={!loading}
            />
          )}

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isRegistering ? 'Mật khẩu tối thiểu 8 ký tự' : 'Mật khẩu'}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegistering((value) => !value)}
            disabled={loading}
          >
            <Text style={styles.switchButtonText}>
              {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký mới'}
            </Text>
          </TouchableOpacity>
        </View>
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
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 16,
    color: '#111827',
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
})
