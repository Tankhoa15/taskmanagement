export interface User {
  id: string
  email: string
  name: string
  pictureUrl?: string
  role: string
  enabled: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  email: string
  name: string
  pictureUrl?: string
}

export interface Task {
  id: string
  title: string
  content?: string
  point: number
  priority: TaskPriority
  status: TaskStatus
  startTime: string
  endTime: string
  assignerId: string
  assignerName: string
  assignerEmail: string
  assigneeId: string
  assigneeName: string
  assigneeEmail: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
}

export type TaskStatus = 'OPEN' | 'PENDING' | 'PROCESS' | 'DONE' | 'CANCEL'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface CreateTaskRequest {
  title: string
  content?: string
  point?: number
  priority: TaskPriority
  startTime: string
  endTime: string
  assigneeId: string
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus
  cancelReason?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errorCode?: string
}
