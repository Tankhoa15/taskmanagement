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
import { useNavigation } from '@react-navigation/native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { userService } from '../services/userService'
import type { CreateTaskRequest, TaskPriority } from '../types'

const priorities: Array<{ key: TaskPriority; label: string; color: string }> = [
  { key: 'LOW', label: 'Thấp', color: '#6b7280' },
  { key: 'MEDIUM', label: 'Trung bình', color: '#3b82f6' },
  { key: 'HIGH', label: 'Cao', color: '#f97316' },
  { key: 'URGENT', label: 'Khẩn cấp', color: '#ef4444' },
]

const getDefaultStartTime = () => {
  const now = new Date()
  now.setHours(now.getHours() + 1, 0, 0, 0)
  return now
}

const getDefaultEndTime = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return date
}

export default function CreateTaskScreen() {
  const navigation = useNavigation()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [point, setPoint] = useState('0')
  const [assigneeId, setAssigneeId] = useState('')
  const [startDateStr, setStartDateStr] = useState('')
  const [endDateStr, setEndDateStr] = useState('')

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      Alert.alert('Thành công', 'Tạo công việc thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    },
    onError: () => {
      Alert.alert('Lỗi', 'Tạo công việc thất bại')
    },
  })

  const validateAndSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề')
      return
    }
    if (!assigneeId) {
      Alert.alert('Lỗi', 'Vui lòng chọn người được giao')
      return
    }

    const startTime = startDateStr ? new Date(startDateStr) : getDefaultStartTime()
    const endTime = endDateStr ? new Date(endDateStr) : getDefaultEndTime()

    if (endTime <= startTime) {
      Alert.alert('Lỗi', 'Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      priority,
      point: parseInt(point) || 0,
      assigneeId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    })
  }

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.label}>Tiêu đề <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề công việc"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Content */}
      <View style={styles.section}>
        <Text style={styles.label}>Nội dung</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mô tả chi tiết công việc"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Priority */}
      <View style={styles.section}>
        <Text style={styles.label}>Độ ưu tiên <Text style={styles.required}>*</Text></Text>
        <View style={styles.priorityRow}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.priorityButton,
                priority === p.key && { backgroundColor: p.color, borderColor: p.color },
              ]}
              onPress={() => setPriority(p.key)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === p.key && styles.priorityTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Point */}
      <View style={styles.section}>
        <Text style={styles.label}>Điểm</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          value={point}
          onChangeText={setPoint}
          keyboardType="numeric"
        />
      </View>

      {/* Time - Using TextInput with placeholder as date picker fallback */}
      <View style={styles.section}>
        <Text style={styles.label}>Thời gian (định dạng: YYYY-MM-DD HH:mm)</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Bắt đầu:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="2024-12-31 09:00"
              value={startDateStr}
              onChangeText={setStartDateStr}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Kết thúc:</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="2024-12-31 18:00"
              value={endDateStr}
              onChangeText={setEndDateStr}
            />
          </View>
        </View>
        <Text style={styles.hint}>VD: 2024-12-31 09:00</Text>
      </View>

      {/* Assignee */}
      <View style={styles.section}>
        <Text style={styles.label}>Người được giao <Text style={styles.required}>*</Text></Text>
        <View style={styles.assigneeList}>
          {users.length === 0 ? (
            <Text style={styles.noUsers}>Đang tải danh sách người dùng...</Text>
          ) : (
            users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.assigneeItem,
                  assigneeId === user.id && styles.assigneeItemSelected,
                ]}
                onPress={() => setAssigneeId(user.id)}
              >
                <View style={styles.assigneeAvatar}>
                  <Text style={styles.assigneeAvatarText}>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.assigneeInfo}>
                  <Text style={styles.assigneeName}>{user.name || 'No name'}</Text>
                  <Text style={styles.assigneeEmail}>{user.email}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={validateAndSubmit}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Tạo công việc</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priorityTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  assigneeList: {
    gap: 8,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  assigneeItemSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  assigneeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assigneeAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  assigneeInfo: {
    flex: 1,
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  assigneeEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  noUsers: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
