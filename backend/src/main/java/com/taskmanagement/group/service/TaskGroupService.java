package com.taskmanagement.group.service;

import com.taskmanagement.common.exception.BusinessException;
import com.taskmanagement.common.exception.ResourceNotFoundException;
import com.taskmanagement.group.dto.*;
import com.taskmanagement.group.entity.GroupRole;
import com.taskmanagement.group.entity.TaskGroup;
import com.taskmanagement.group.entity.TaskGroupMember;
import com.taskmanagement.group.repository.TaskGroupMemberRepository;
import com.taskmanagement.group.repository.TaskGroupRepository;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class TaskGroupService {

    @Inject
    TaskGroupRepository groupRepository;

    @Inject
    TaskGroupMemberRepository memberRepository;

    @Inject
    UserRepository userRepository;

    @Transactional
    public GroupDto createGroup(CreateGroupRequest request, UUID ownerId) {
        User owner = userRepository.findByIdOptional(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        TaskGroup group = TaskGroup.builder()
                .name(request.getName().trim())
                .owner(owner)
                .build();
        groupRepository.persist(group);

        TaskGroupMember ownerMember = TaskGroupMember.builder()
                .group(group)
                .user(owner)
                .role(GroupRole.ADMIN)
                .build();
        memberRepository.persist(ownerMember);

        return toDto(group, GroupRole.ADMIN);
    }

    public List<GroupDto> getMyGroups(UUID userId) {
        return groupRepository.findGroupsForUser(userId).stream()
                .map(group -> toDto(group, getRole(group.getId(), userId)))
                .collect(Collectors.toList());
    }

    public List<GroupMemberDto> getMembers(UUID groupId, UUID userId) {
        requireMember(groupId, userId);
        return memberRepository.findByGroup(groupId).stream()
                .map(this::toMemberDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupMemberDto addMember(UUID groupId, AddGroupMemberRequest request, UUID adminId) {
        requireAdmin(groupId, adminId);

        TaskGroup group = groupRepository.findByIdOptional(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", groupId));
        User user = userRepository.findByIdOptional(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        TaskGroupMember member = memberRepository.findByGroupAndUser(groupId, request.getUserId())
                .orElseGet(() -> TaskGroupMember.builder()
                        .group(group)
                        .user(user)
                        .build());

        member.setRole(request.getRole());
        memberRepository.persist(member);
        return toMemberDto(member);
    }

    @Transactional
    public GroupMemberDto updateMemberRole(UUID groupId, UUID userId, UpdateGroupMemberRoleRequest request, UUID adminId) {
        requireAdmin(groupId, adminId);
        TaskGroupMember member = memberRepository.findByGroupAndUser(groupId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Group member", "userId", userId));
        member.setRole(request.getRole());
        memberRepository.persist(member);
        return toMemberDto(member);
    }

    @Transactional
    public void removeMember(UUID groupId, UUID targetUserId, UUID adminId) {
        requireAdmin(groupId, adminId);
        if (adminId.equals(targetUserId)) {
            throw new BusinessException("You cannot remove yourself from the group", "CANNOT_REMOVE_SELF");
        }
        TaskGroupMember member = memberRepository.findByGroupAndUser(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Group member", "userId", targetUserId));
        memberRepository.delete(member);
    }

    public void requireMember(UUID groupId, UUID userId) {
        if (!memberRepository.isMember(groupId, userId)) {
            throw new BusinessException("You are not a member of this group", "GROUP_ACCESS_DENIED");
        }
    }

    public void requireAdmin(UUID groupId, UUID userId) {
        if (!memberRepository.isAdmin(groupId, userId)) {
            throw new BusinessException("Only group admins can perform this action", "GROUP_ADMIN_REQUIRED");
        }
    }

    public boolean isAdmin(UUID groupId, UUID userId) {
        return memberRepository.isAdmin(groupId, userId);
    }

    public GroupRole getRole(UUID groupId, UUID userId) {
        return memberRepository.findByGroupAndUser(groupId, userId)
                .map(TaskGroupMember::getRole)
                .orElse(null);
    }

    private GroupDto toDto(TaskGroup group, GroupRole currentUserRole) {
        return GroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .ownerId(group.getOwner().getId())
                .ownerName(group.getOwner().getName())
                .ownerEmail(group.getOwner().getEmail())
                .currentUserRole(currentUserRole)
                .createdAt(group.getCreatedAt())
                .build();
    }

    private GroupMemberDto toMemberDto(TaskGroupMember member) {
        return GroupMemberDto.builder()
                .userId(member.getUser().getId())
                .name(member.getUser().getName())
                .email(member.getUser().getEmail())
                .role(member.getRole())
                .build();
    }
}
