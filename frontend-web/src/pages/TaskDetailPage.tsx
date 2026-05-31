import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { groupService } from '../services/groupService'
import { useAuthStore } from '../store/authStore'
import CommentSection from '../components/CommentSection'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import clsx from 'clsx'
import type { TaskStatus } from '../types'

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  OPEN: { label: 'Mới', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PENDING: { label: 'Chờ', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESS: { label: 'Đang xử lý', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  DONE: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCEL: { label: 'Hủy', color: 'bg-gray-100 text-gray-800', icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Thấp', color: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Trung bình', color: 'bg-blue-100 text-blue-600' },
  HIGH: { label: 'Cao', color: 'bg-orange-100 text-orange-600' },
  URGENT: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-600' },
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTaskById(id!),
    enabled: !!id,
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getMyGroups,
  })

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: TaskStatus; reason?: string }) => 
      taskService.updateTaskStatus(id!, { status, cancelReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Cập nhật trạng thái thành công!')
      setShowCancelModal(false)
      setCancelReason('')
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy công việc</p>
        <Link to="/tasks" className="text-primary-600 hover:underline mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  const isAssigner = user?.email === task.assignerEmail
  const isAssignee = user?.email === task.assigneeEmail
  const isGroupAdmin = groups.some((group) => group.id === task.groupId && group.currentUserRole === 'ADMIN')
  const canEdit = isAssignee || isGroupAdmin || (isAssigner && !task.groupId)
  const StatusIcon = statusConfig[task.status].icon

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tasks" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Quay lại danh sách
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', statusConfig[task.status].color)}>
                <StatusIcon size={12} className="inline mr-1" />
                {statusConfig[task.status].label}
              </span>
              <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', priorityConfig[task.priority].color)}>
                {priorityConfig[task.priority].label}
              </span>
              {task.groupName && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                  {task.groupName}
                </span>
              )}
            </div>
          </div>
          
          {canEdit && task.status !== 'DONE' && task.status !== 'CANCEL' && (
            <div className="flex gap-2">
              {task.status === 'OPEN' && (
                <button
                  onClick={() => statusMutation.mutate({ status: 'PENDING' })}
                  disabled={statusMutation.isPending}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  Bắt đầu
                </button>
              )}
              {(task.status === 'PENDING' || task.status === 'PROCESS') && (
                <button
                  onClick={() => statusMutation.mutate({ status: 'PROCESS' })}
                  disabled={statusMutation.isPending}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  Đang xử lý
                </button>
              )}
              <button
                onClick={() => statusMutation.mutate({ status: 'DONE' })}
                disabled={statusMutation.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Hoàn thành
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Description */}
        {task.content && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{task.content}</p>
          </div>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <User size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Người giao</p>
              <p className="font-medium text-gray-900">{task.assignerName || task.assignerEmail}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <User size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Người nhận</p>
              <p className="font-medium text-gray-900">{task.assigneeName || task.assigneeEmail}</p>
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center">
            <Calendar size={18} className="text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Bắt đầu</p>
              <p className="font-medium text-gray-900">
                {format(new Date(task.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar size={18} className="text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Kết thúc</p>
              <p className="font-medium text-gray-900">
                {format(new Date(task.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
          </div>
        </div>

        {/* Point */}
        {task.point > 0 && (
          <div className="flex items-center p-4 bg-primary-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <span className="text-primary-600 font-bold">{task.point}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Điểm công việc</p>
              <p className="font-medium text-gray-900">{task.point} điểm</p>
            </div>
          </div>
        )}

        {/* Cancel reason */}
        {task.cancelReason && (
          <div className="flex items-center p-4 bg-red-50 rounded-lg">
            <XCircle size={18} className="text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Lý do hủy</p>
              <p className="font-medium text-gray-900">{task.cancelReason}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Lịch sử</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tạo lúc:</span>
              <span className="text-gray-900">
                {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </span>
            </div>
            {task.updatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cập nhật:</span>
                <span className="text-gray-900">
                  {format(new Date(task.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>
            )}
            {task.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Hoàn thành:</span>
                <span className="text-green-600 font-medium">
                  {format(new Date(task.completedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentSection taskId={id!} />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hủy công việc</h3>
            <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn hủy công việc này?</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Lý do hủy (tùy chọn)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => statusMutation.mutate({ status: 'CANCEL', reason: cancelReason })}
                disabled={statusMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Hủy công việc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
