import { create } from 'zustand'
import type { Task, TaskStatus } from '../types'

interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  filterStatus: TaskStatus | 'ALL'
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (taskId: string) => void
  setSelectedTask: (task: Task | null) => void
  setFilterStatus: (status: TaskStatus | 'ALL') => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  selectedTask: null,
  filterStatus: 'ALL',
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    selectedTask: state.selectedTask?.id === task.id ? task : state.selectedTask,
  })),
  
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId),
    selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
  })),
  
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  setFilterStatus: (status) => set({ filterStatus: status }),
}))
