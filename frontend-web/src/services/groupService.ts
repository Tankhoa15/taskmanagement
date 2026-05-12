import api from './api'
import type { ApiResponse, GroupMember, GroupRole, TaskGroup } from '../types'

export const groupService = {
  getMyGroups: async (): Promise<TaskGroup[]> => {
    const response = await api.get<ApiResponse<TaskGroup[]>>('/api/groups')
    return response.data.data || []
  },

  createGroup: async (name: string): Promise<TaskGroup> => {
    const response = await api.post<ApiResponse<TaskGroup>>('/api/groups', { name })
    return response.data.data
  },

  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    const response = await api.get<ApiResponse<GroupMember[]>>(`/api/groups/${groupId}/members`)
    return response.data.data || []
  },

  addMember: async (groupId: string, userId: string, role: GroupRole): Promise<GroupMember> => {
    const response = await api.post<ApiResponse<GroupMember>>(`/api/groups/${groupId}/members`, {
      userId,
      role,
    })
    return response.data.data
  },

  updateMemberRole: async (groupId: string, userId: string, role: GroupRole): Promise<GroupMember> => {
    const response = await api.patch<ApiResponse<GroupMember>>(`/api/groups/${groupId}/members/${userId}/role`, {
      role,
    })
    return response.data.data
  },
}
