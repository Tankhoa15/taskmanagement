import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { taskService } from '../services/taskService'
import { groupService } from '../services/groupService'
import toast from 'react-hot-toast'
import { ArrowLeft, Calendar, User, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CreateTaskRequest } from '../types'

const schema = yup.object({
  title: yup.string().required('Tiêu đề là bắt buộc').min(3, 'Tối thiểu 3 ký tự'),
  content: yup.string().optional(),
  point: yup.number().min(0, 'Điểm không được âm').max(100, 'Tối đa 100 điểm').optional(),
  priority: yup.string().required('Ưu tiên là bắt buộc'),
  startTime: yup.string().required('Thời gian bắt đầu là bắt buộc'),
  endTime: yup.string().required('Thời gian kết thúc là bắt buộc'),
  groupId: yup.string().required('Nhóm là bắt buộc'),
  assigneeId: yup.string().required('Người được giao là bắt buộc'),
})

type FormData = yup.InferType<typeof schema>

export default function CreateTaskPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getMyGroups,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tạo công việc thành công!')
      navigate('/tasks')
    },
    onError: () => {
      toast.error('Tạo công việc thất bại')
    },
  })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: 'MEDIUM',
      point: 0,
    },
  })

  const startTime = watch('startTime')
  const endTime = watch('endTime')
  const groupId = watch('groupId')

  const { data: members = [] } = useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => groupService.getMembers(groupId),
    enabled: Boolean(groupId),
  })

  const adminGroups = groups.filter((group) => group.currentUserRole === 'ADMIN')

  const onSubmit = (data: FormData) => {
    createMutation.mutate({
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    } as CreateTaskRequest)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tasks" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tạo công việc mới</h1>
        <p className="text-gray-600 mt-1">Điền thông tin để tạo công việc mới</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title')}
            placeholder="Nhập tiêu đề công việc"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung
          </label>
          <textarea
            {...register('content')}
            rows={4}
            placeholder="Mô tả chi tiết công việc"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Priority & Point */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ ưu tiên <span className="text-red-500">*</span>
            </label>
            <select
              {...register('priority')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm
            </label>
            <input
              type="number"
              {...register('point')}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1" />
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('startTime')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1" />
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('endTime')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhóm <span className="text-red-500">*</span>
          </label>
          <select
            {...register('groupId')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Chọn nhóm quản lý task</option>
            {adminGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {errors.groupId && <p className="text-red-500 text-sm mt-1">{errors.groupId.message}</p>}
          {adminGroups.length === 0 && (
            <p className="text-amber-600 text-sm mt-1">Bạn cần tạo nhóm hoặc được cấp quyền admin nhóm trước khi giao task.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={14} className="inline mr-1" />
            Người được giao <span className="text-red-500">*</span>
          </label>
          <select
            {...register('assigneeId')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Chọn người được giao</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name || member.email} ({member.email})
              </option>
            ))}
          </select>
          {errors.assigneeId && <p className="text-red-500 text-sm mt-1">{errors.assigneeId.message}</p>}
        </div>

        {/* Warning */}
        {startTime && endTime && new Date(endTime) <= new Date(startTime) && (
          <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <p className="text-sm">Thời gian kết thúc phải sau thời gian bắt đầu</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo công việc'}
          </button>
        </div>
      </form>
    </div>
  )
}
