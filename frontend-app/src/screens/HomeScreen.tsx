import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { useAuthStore } from '../store/authStore'
import type { Task, TaskStatus } from '../types'

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

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { user } = useAuthStore()
  
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: taskService.getMyTasks,
  })

  const stats = {
    total: tasks?.length || 0,
    open: tasks?.filter(t => t.status === 'OPEN').length || 0,
    inProgress: tasks?.filter(t => t.status === 'PROCESS' || t.status === 'PENDING').length || 0,
    done: tasks?.filter(t => t.status === 'DONE').length || 0,
  }

  const urgentTasks = tasks?.filter(t => 
    t.priority === 'URGENT' && t.status !== 'DONE' && t.status !== 'CANCEL'
  ).slice(0, 3) || []

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào, {user?.name || 'User'} 👋</Text>
        <Text style={styles.subtitle}>Cùng xem công việc hôm nay</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.statValue, { color: '#2563eb' }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: '#3b82f6' }]}>Tổng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef9c3' }]}>
          <Text style={[styles.statValue, { color: '#ca8a04' }]}>{stats.open}</Text>
          <Text style={[styles.statLabel, { color: '#a16207' }]}>Mới</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ffedd5' }]}>
          <Text style={[styles.statValue, { color: '#ea580c' }]}>{stats.inProgress}</Text>
          <Text style={[styles.statLabel, { color: '#c2410c' }]}>Xử lý</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{stats.done}</Text>
          <Text style={[styles.statLabel, { color: '#15803d' }]}>Done</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Text style={styles.createButtonText}>+ Tạo công việc mới</Text>
      </TouchableOpacity>

      {/* Urgent Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Công việc khẩn cấp</Text>
        {urgentTasks.length > 0 ? (
          urgentTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.urgentTask}
              onPress={() => navigation.navigate('TaskDetail', { id: task.id })}
            >
              <View style={styles.urgentTaskContent}>
                <Text style={styles.urgentTaskTitle}>{task.title}</Text>
                <Text style={styles.urgentTaskDate}>
                  Hạn: {format(new Date(task.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có công việc khẩn cấp</Text>
        )}
      </View>
    </ScrollView>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  createButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  urgentTask: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  urgentTaskContent: {
    flex: 1,
  },
  urgentTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  urgentTaskDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20,
  },
})
