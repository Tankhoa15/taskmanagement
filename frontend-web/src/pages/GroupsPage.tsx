import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Shield, UserPlus, Users, Trash2 } from 'lucide-react'
import { groupService } from '../services/groupService'
import { userService } from '../services/userService'
import { useAuthStore } from '../store/authStore'
import type { GroupRole } from '../types'

export default function GroupsPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [groupName, setGroupName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<GroupRole>('MEMBER')

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupService.getMyGroups,
  })
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  })

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || groups[0],
    [groups, selectedGroupId]
  )

  const { data: members = [] } = useQuery({
    queryKey: ['groups', activeGroup?.id, 'members'],
    queryFn: () => groupService.getMembers(activeGroup!.id),
    enabled: Boolean(activeGroup?.id),
  })

  const createGroup = useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: (group) => {
      setGroupName('')
      setSelectedGroupId(group.id)
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Tạo nhóm thành công')
    },
  })

  const addMember = useMutation({
    mutationFn: () => groupService.addMember(activeGroup!.id, selectedUserId, selectedRole),
    onSuccess: () => {
      setSelectedUserId('')
      queryClient.invalidateQueries({ queryKey: ['groups', activeGroup?.id, 'members'] })
      toast.success('Đã cập nhật thành viên')
    },
  })

  const changeRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: GroupRole }) =>
      groupService.updateMemberRole(activeGroup!.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', activeGroup?.id, 'members'] })
      toast.success('Đã cập nhật quyền')
    },
  })

  const removeMember = useMutation({
    mutationFn: (userId: string) => groupService.removeMember(activeGroup!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', activeGroup?.id, 'members'] })
      toast.success('Đã xóa thành viên')
    },
    onError: () => toast.error('Xóa thành viên thất bại'),
  })

  const canManage = activeGroup?.currentUserRole === 'ADMIN'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <p className="text-gray-600 mt-1">Tạo nhóm, thêm thành viên và chia sẻ quyền quản lý task.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center">
            <Users size={18} className="mr-2" />
            Nhóm của tôi
          </h2>
          <div className="space-y-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border ${
                  activeGroup?.id === group.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{group.name}</div>
                <div className="text-xs text-gray-500">{group.currentUserRole}</div>
              </button>
            ))}
          </div>
          <form
            className="pt-4 border-t border-gray-100 space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (groupName.trim()) createGroup.mutate(groupName.trim())
            }}
          >
            <input
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Tên nhóm mới"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={createGroup.isPending}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              Tạo nhóm
            </button>
          </form>
        </section>

        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{activeGroup?.name || 'Chưa có nhóm'}</h2>
            {canManage && (
              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                <Shield size={14} className="mr-1" />
                Admin
              </span>
            )}
          </div>

          {canManage && activeGroup && (
            <form
              className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (selectedUserId) addMember.mutate()
              }}
            >
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Chọn user để thêm vào nhóm</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.email})
                  </option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value as GroupRole)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                disabled={addMember.isPending || !selectedUserId}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
              >
                <UserPlus size={16} className="mr-2" />
                Thêm
              </button>
            </form>
          )}

          <div className="divide-y divide-gray-100">
            {members.map((member) => {
              const isSelf = member.userId === currentUser?.id
              return (
                <div key={member.userId} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-gray-900">{member.name || member.email}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                  {canManage ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        disabled={isSelf}
                        onChange={(event) => changeRole.mutate({ userId: member.userId, role: event.target.value as GroupRole })}
                        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {!isSelf && (
                        <button
                          onClick={() => removeMember.mutate(member.userId)}
                          disabled={removeMember.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa thành viên"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{member.role}</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
