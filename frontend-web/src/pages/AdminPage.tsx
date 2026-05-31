import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { userService } from '../services/userService'
import { useAuthStore } from '../store/authStore'
import { Shield, UserCheck, Lock, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function AdminPage() {
  const { user: currentUser } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  })

  const toggleLock = useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) =>
      userService.setUserEnabled(userId, enabled),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(updated.enabled ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Thao tác thất bại'
      toast.error(msg)
    },
  })

  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      userService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Đã cập nhật quyền')
    },
    onError: () => toast.error('Cập nhật quyền thất bại'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={24} className="text-primary-600" />
          Quản trị hệ thống
        </h1>
        <p className="text-gray-600 mt-1">Quản lý tài khoản và phân quyền người dùng</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <span className="font-medium text-gray-900">Danh sách người dùng ({users.length})</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => {
              const isSelf = user.id === currentUser?.id
              const isTargetAdmin = user.role === 'ADMIN'
              const canLock = !isSelf && !isTargetAdmin

              return (
                <div key={user.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">{user.name || 'Chưa đặt tên'}</span>
                      {isSelf && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">Bạn</span>
                      )}
                      {!user.enabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          <Lock size={10} /> Đã khóa
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Tham gia: {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Role selector */}
                    <div className="relative">
                      <select
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) => changeRole.mutate({ userId: user.id, role: e.target.value })}
                        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Lock / Unlock button — chỉ hiện với USER thường, không phải self */}
                    {canLock ? (
                      <button
                        disabled={toggleLock.isPending}
                        onClick={() => toggleLock.mutate({ userId: user.id, enabled: !user.enabled })}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                          user.enabled
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {user.enabled ? (
                          <><Lock size={14} />Khóa</>
                        ) : (
                          <><UserCheck size={14} />Mở khóa</>
                        )}
                      </button>
                    ) : (
                      <span className="px-3 py-2 text-xs text-gray-400 italic">
                        {isSelf ? 'Tài khoản của bạn' : 'Không thể khóa Admin'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
