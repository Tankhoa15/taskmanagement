package com.taskmanagement.group.repository;

import com.taskmanagement.group.entity.GroupRole;
import com.taskmanagement.group.entity.TaskGroupMember;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class TaskGroupMemberRepository implements PanacheRepositoryBase<TaskGroupMember, UUID> {

    public Optional<TaskGroupMember> findByGroupAndUser(UUID groupId, UUID userId) {
        return find("group.id = ?1 and user.id = ?2", groupId, userId).firstResultOptional();
    }

    public List<TaskGroupMember> findByGroup(UUID groupId) {
        return list("group.id", Sort.by("createdAt").ascending(), groupId);
    }

    public boolean isMember(UUID groupId, UUID userId) {
        return count("group.id = ?1 and user.id = ?2", groupId, userId) > 0;
    }

    public boolean isAdmin(UUID groupId, UUID userId) {
        return count("group.id = ?1 and user.id = ?2 and role = ?3", groupId, userId, GroupRole.ADMIN) > 0;
    }
}
