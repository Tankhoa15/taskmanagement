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
  userId: string
  email: string
  name: string
  pictureUrl?: string
  role: string
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
  groupId?: string
  groupName?: string
  labels?: Label[]
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
  groupId: string
  labelIds?: string[]
}

export interface UpdateTaskRequest {
  title?: string
  content?: string
  point?: number
  priority?: TaskPriority
  startTime?: string
  endTime?: string
  assigneeId?: string
  cancelReason?: string
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

export type GroupRole = 'ADMIN' | 'MEMBER'

export interface TaskGroup {
  id: string
  name: string
  ownerId: string
  ownerName?: string
  ownerEmail: string
  currentUserRole: GroupRole
  createdAt: string
}

export interface GroupMember {
  userId: string
  name?: string
  email: string
  role: GroupRole
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Comment {
  id: string
  taskId: string
  authorId: string
  authorName?: string
  authorEmail: string
  content: string
  createdAt: string
}
