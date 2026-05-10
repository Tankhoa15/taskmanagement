import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import type { Task, TaskStatus } from '../types'

const statusLabels: Record<TaskStatus, string> = {
  OPEN: 'Mới',
  PENDING: 'Chờ',
  PROCESS: 'Đang xử lý',
  DONE: 'Hoàn thành',
  CANCEL: 'Hủy',
}

const statusColors: Record<TaskStatus, string> = {
  OPEN: '#3b82f6',
  PENDING: '#eab308',
  PROCESS: '#f97316',
  DONE: '#22c55e',
  CANCEL: '#6b7280',
}

const priorityColors: Record<string, string> = {
  LOW: '#6b7280',
  MEDIUM: '#3b82f6',
  HIGH: '#f97316',
  URGENT: '#ef4444',
}

type RootStackParamList = {
  TaskDetail: { id: string }
  CreateTask: undefined
}

const filters: Array<{ key: TaskStatus | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'OPEN', label: 'Mới' },
  { key: 'PENDING', label: 'Chờ' },
  { key: 'PROCESS', label: 'Xử lý' },
  { key: 'DONE', label: 'Done' },
]

export default function TaskListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getMyTasks,
  })

  const filteredTasks = tasks?.filter(task => {
    const matchesFilter = filter === 'ALL' || task.status === filter
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  }) || []

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
    >
      <View style={styles.taskHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {statusLabels[item.status]}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] + '20' }]}>
          <Text style={[styles.priorityText, { color: priorityColors[item.priority] }]}>
            {item.priority === 'URGENT' ? 'Khẩn' : item.priority === 'HIGH' ? 'Cao' : item.priority === 'MEDIUM' ? 'TB' : 'Thấp'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
      
      <View style={styles.taskFooter}>
        <Text style={styles.taskAssignee}>
          👤 {item.assigneeName || item.assigneeEmail}
        </Text>
        <Text style={styles.taskDate}>
          📅 {format(new Date(item.endTime), 'dd/MM/yyyy')}
        </Text>
      </View>
      
      {item.point > 0 && (
        <View style={styles.pointBadge}>
          <Text style={styles.pointText}>{item.point} điểm</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm công việc..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có công việc nào</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskAssignee: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  pointBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#2563eb20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
})
