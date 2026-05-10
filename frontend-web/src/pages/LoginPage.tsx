import { useState } from 'react'
import { Lock, Mail, User } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      const authResponse = isRegistering
        ? await authService.register(name, email, password)
        : await authService.login(email, password)

      login(authResponse)
      toast.success(isRegistering ? 'Đăng ký thành công!' : 'Đăng nhập thành công!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(isRegistering ? 'Đăng ký thất bại. Vui lòng thử lại.' : 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.')
      console.error('Authentication error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">
            {isRegistering ? 'Tạo tài khoản nội bộ' : 'Đăng nhập bằng email và mật khẩu'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Tên hiển thị</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required={isRegistering}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegistering ? 8 : undefined}
                required
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-gray-900 outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                placeholder={isRegistering ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu'}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex h-12 items-center justify-center rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              isRegistering ? 'Đăng ký' : 'Đăng nhập'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegistering((value) => !value)}
            className="font-medium text-primary-600 hover:underline"
          >
            {isRegistering ? 'Đăng nhập' : 'Đăng ký mới'}
          </button>
        </p>
      </div>
    </div>
  )
}
