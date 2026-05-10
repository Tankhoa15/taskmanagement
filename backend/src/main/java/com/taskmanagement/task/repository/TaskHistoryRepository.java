package com.taskmanagement.task.repository;

import com.taskmanagement.task.entity.TaskHistory;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TaskHistoryRepository implements PanacheRepositoryBase<TaskHistory, UUID> {
    
    public List<TaskHistory> findByTaskId(UUID taskId) {
        return list("taskId", Sort.by("createdAt").descending(), taskId);
    }
    
    public List<TaskHistory> findByUserId(UUID userId) {
        return list("userId", Sort.by("createdAt").descending(), userId);
    }
}
