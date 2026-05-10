import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { useAuthStore } from '../store/authStore'
import type { Task, TaskStatus } from '../types'

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  OPEN: { label: 'Mới', color: '#3b82f6' },
  PENDING: { label: 'Chờ', color: '#eab308' },
  PROCESS: { label: 'Đang xử lý', color: '#f97316' },
  DONE: { label: 'Hoàn thành', color: '#22c55e' },
  CANCEL: { label: 'Hủy', color: '#6b7280' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Thấp', color: '#6b7280' },
  MEDIUM: { label: 'Trung bình', color: '#3b82f6' },
  HIGH: { label: 'Cao', color: '#f97316' },
  URGENT: { label: 'Khẩn cấp', color: '#ef4444' },
}

type RouteParams = {
  TaskDetail: { id: string }
}

export default function TaskDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RouteParams, 'TaskDetail'>>()
  const { id } = route.params
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: TaskStatus; reason?: string }) =>
      taskService.updateTaskStatus(id, { status, cancelReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      Alert.alert('Thành công', 'Cập nhật trạng thái thành công!')
      setShowCancelModal(false)
      setCancelReason('')
    },
    onError: () => {
      Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại')
    },
  })

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy công việc</Text>
      </View>
    )
  }

  const isAssigner = user?.email === task.assignerEmail
  const isAssignee = user?.email === task.assigneeEmail
  const canEdit = isAssigner || isAssignee
  const isActive = task.status !== 'DONE' && task.status !== 'CANCEL'

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: statusConfig[task.status].color + '20' }]}>
            <Text style={[styles.badgeText, { color: statusConfig[task.status].color }]}>
              {statusConfig[task.status].label}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: priorityConfig[task.priority].color + '20' }]}>
            <Text style={[styles.badgeText, { color: priorityConfig[task.priority].color }]}>
              {priorityConfig[task.priority].label}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.content}>
          {task.content || 'Không có mô tả'}
        </Text>
      </View>

      {/* People */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Người tham gia</Text>
        <View style={styles.personRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(task.assignerName || task.assignerEmail).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.personLabel}>Người giao</Text>
            <Text style={styles.personName}>{task.assignerName || task.assignerEmail}</Text>
          </View>
        </View>
        <View style={[styles.personRow, { marginTop: 12 }]}>
          <View style={[styles.avatar, { backgroundColor: '#22c55e' }]}>
            <Text style={styles.avatarText}>
              {(task.assigneeName || task.assigneeEmail).charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.personLabel}>Người nhận</Text>
            <Text style={styles.personName}>{task.assigneeName || task.assigneeEmail}</Text>
          </View>
        </View>
      </View>

      {/* Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thời gian</Text>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Bắt đầu:</Text>
          <Text style={styles.timeValue}>
            {format(new Date(task.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Kết thúc:</Text>
          <Text style={[styles.timeValue, { color: '#ef4444' }]}>
            {format(new Date(task.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </Text>
        </View>
        {task.point > 0 && (
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>Điểm:</Text>
            <Text style={styles.pointValue}>{task.point} điểm</Text>
          </View>
        )}
      </View>

      {/* Cancel Reason */}
      {task.cancelReason && (
        <View style={styles.cancelSection}>
          <Text style={styles.cancelLabel}>Lý do hủy:</Text>
          <Text style={styles.cancelText}>{task.cancelReason}</Text>
        </View>
      )}

      {/* Actions */}
      {canEdit && isActive && (
        <View style={styles.actionContainer}>
          {task.status === 'OPEN' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#eab308' }]}
              onPress={() => statusMutation.mutate({ status: 'PENDING' })}
              disabled={statusMutation.isPending}
            >
              <Text style={styles.actionText}>Bắt đầu</Text>
            </TouchableOpacity>
          )}
          {(task.status === 'PENDING' || task.status === 'PROCESS') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f97316' }]}
              onPress={() => statusMutation.mutate({ status: 'PROCESS' })}
              disabled={statusMutation.isPending}
            >
              <Text style={styles.actionText}>Đang xử lý</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
            onPress={() => statusMutation.mutate({ status: 'DONE' })}
            disabled={statusMutation.isPending}
          >
            <Text style={styles.actionText}>Hoàn thành</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.actionText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Hủy công việc</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Lý do hủy (tùy chọn)"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#e5e7eb' }]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#374151' }]}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ef4444' }]}
                onPress={() => statusMutation.mutate({ status: 'CANCEL', reason: cancelReason })}
                disabled={statusMutation.isPending}
              >
                <Text style={styles.modalButtonText}>Hủy công việc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  personLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pointLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  pointValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  cancelSection: {
    backgroundColor: '#fef2f2',
    padding: 20,
    marginTop: 12,
  },
  cancelLabel: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#1f2937',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
