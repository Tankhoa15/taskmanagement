import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useQuery, useMutation } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  ListTodo,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Settings,
  Kanban,
  Trash2
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/board',     label: 'Board',     icon: Kanban },
  { path: '/tasks',     label: 'Tasks',     icon: ListTodo },
  { path: '/users',     label: 'Users',     icon: Users },
  { path: '/groups',    label: 'Groups',    icon: Shield },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const deleteSelf = useMutation({
    mutationFn: userService.deleteSelf,
    onSuccess: () => {
      toast.success('Tài khoản đã được xóa')
      logout()
    },
    onError: () => toast.error('Xóa tài khoản thất bại'),
  })
  const location = useLocation()
  const { data: assignedTasks = [] } = useQuery({
    queryKey: ['tasks', 'assigned', 'notification-count'],
    queryFn: taskService.getAssignedTasks,
    refetchInterval: 30000,
  })
  const activeAssignedCount = assignedTasks.filter(
    (task) => task.status !== 'DONE' && task.status !== 'CANCEL'
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">TaskManager</span>
          <button 
            className="lg:hidden p-2 text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={clsx(
                "flex items-center px-4 py-3 rounded-lg transition-colors",
                location.pathname === '/admin'
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Settings size={20} className="mr-3" />
              Quản trị
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  <Shield size={10} />
                  Admin
                </span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
          <button
            onClick={() => { setDeleteInput(''); setShowDeleteConfirm(true) }}
            className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 size={16} className="mr-2" />
            Xóa tài khoản
          </button>
        </div>
      </aside>

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xóa tài khoản</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 space-y-1">
              <p>• Tài khoản của bạn sẽ bị xóa vĩnh viễn</p>
              <p>• Dữ liệu cá nhân sẽ được ẩn danh hóa</p>
              <p>• Các task bạn đã tạo/nhận vẫn được giữ lại</p>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              Gõ <strong>XOA</strong> để xác nhận:
            </p>
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="XOA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Hủy
              </button>
              <button
                disabled={deleteInput !== 'XOA' || deleteSelf.isPending}
                onClick={() => deleteSelf.mutate()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
              >
                {deleteSelf.isPending ? 'Đang xóa...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-4">
            <button 
              className="lg:hidden p-2 text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center ml-auto space-x-4">
              <Link
                to="/tasks"
                title="Xem công việc được giao"
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={20} />
                {activeAssignedCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {activeAssignedCount > 9 ? '9+' : activeAssignedCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
