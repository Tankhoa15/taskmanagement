import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { taskService } from '../services/taskService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Plus, 
  Filter, 
  Search,
  Calendar,
  User
} from 'lucide-react'
import clsx from 'clsx'
import type { TaskStatus, Task } from '../types'

const statusLabels: Record<TaskStatus, string> = {
  OPEN: 'Mới',
  PENDING: 'Chờ',
  PROCESS: 'Đang xử lý',
  DONE: 'Hoàn thành',
  CANCEL: 'Hủy',
}

const statusColors: Record<TaskStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESS: 'bg-orange-100 text-orange-800',
  DONE: 'bg-green-100 text-green-800',
  CANCEL: 'bg-gray-100 text-gray-800',
}

const priorityLabels: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
}

export default function TasksPage() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: taskService.getMyTasks,
  })

  const filteredTasks = tasks?.filter(task => {
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Công việc của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi công việc</p>
        </div>
        <button
          onClick={() => navigate('/tasks/create')}
          className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Tạo công việc
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">Tất cả</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Không có công việc nào</h3>
          <p className="text-gray-500 mt-2">Bắt đầu bằng cách tạo công việc mới</p>
          <button
            onClick={() => navigate('/tasks/create')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tạo công việc
          </button>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', statusColors[task.status])}>
              {statusLabels[task.status]}
            </span>
            <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', priorityColors[task.priority])}>
              {priorityLabels[task.priority]}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          {task.content && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.content}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>{task.assigneeName || task.assigneeEmail}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{format(new Date(task.endTime), 'dd/MM/yyyy', { locale: vi })}</span>
            </div>
            {task.point > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                {task.point} điểm
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
