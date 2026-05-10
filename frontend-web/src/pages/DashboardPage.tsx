import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { taskService } from '../services/taskService'
import { useAuthStore } from '../store/authStore'
import { 
  ListTodo, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import clsx from 'clsx'

export default function DashboardPage() {
  const { user } = useAuthStore()
  
  const { data: myTasks, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: taskService.getMyTasks,
  })

  const stats = {
    total: myTasks?.length || 0,
    open: myTasks?.filter(t => t.status === 'OPEN').length || 0,
    inProgress: myTasks?.filter(t => t.status === 'PROCESS' || t.status === 'PENDING').length || 0,
    done: myTasks?.filter(t => t.status === 'DONE').length || 0,
  }

  const urgentTasks = myTasks?.filter(t => 
    t.priority === 'URGENT' && t.status !== 'DONE' && t.status !== 'CANCEL'
  ).slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Chào mừng, {user?.name || 'User'} 👋
        </h1>
        <p className="text-gray-600 mt-1">Cùng xem công việc hôm nay của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tổng công việc" 
          value={stats.total} 
          icon={ListTodo}
          color="blue"
        />
        <StatCard 
          title="Đang chờ" 
          value={stats.open} 
          icon={Clock}
          color="yellow"
        />
        <StatCard 
          title="Đang xử lý" 
          value={stats.inProgress} 
          icon={TrendingUp}
          color="orange"
        />
        <StatCard 
          title="Hoàn thành" 
          value={stats.done} 
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Quick actions & Urgent tasks */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <Link
              to="/tasks/create"
              className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Plus className="text-white" size={20} />
                </div>
                <span className="ml-3 font-medium text-gray-900">Tạo công việc mới</span>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </Link>
            <Link
              to="/tasks"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                  <ListTodo className="text-white" size={20} />
                </div>
                <span className="ml-3 font-medium text-gray-900">Xem tất cả công việc</span>
              </div>
              <ArrowRight className="text-gray-400" size={20} />
            </Link>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            Công việc khẩn cấp
          </h2>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : urgentTasks.length > 0 ? (
            <div className="space-y-3">
              {urgentTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Hạn: {format(new Date(task.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Không có công việc khẩn cấp</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: any
  color: 'blue' | 'yellow' | 'orange' | 'green'
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={clsx("p-3 rounded-lg", colors[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
