import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/userService'
import { useAuthStore } from '../store/authStore'
import { Users, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
        <p className="text-gray-600 mt-1">Danh sách người dùng trong hệ thống</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map(user => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-lg">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name || 'No name'}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {currentUser?.email === user.email && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    Bạn
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Mail size={14} className="mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar size={14} className="mr-2" />
                  Tham gia: {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!users || users.length === 0) && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Không có người dùng nào</h3>
          <p className="text-gray-500 mt-2">Danh sách người dùng trống</p>
        </div>
      )}
    </div>
  )
}
