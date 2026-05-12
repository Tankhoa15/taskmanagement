package com.taskmanagement.group.repository;

import com.taskmanagement.group.entity.TaskGroup;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TaskGroupRepository implements PanacheRepositoryBase<TaskGroup, UUID> {

    public List<TaskGroup> findGroupsForUser(UUID userId) {
        return find("select distinct g from TaskGroup g join TaskGroupMember m on m.group = g where m.user.id = ?1 order by g.name asc",
                userId).list();
    }
}
