package com.taskmanagement.task.repository;

import com.taskmanagement.task.entity.Task;
import com.taskmanagement.task.entity.TaskStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TaskRepository implements PanacheRepositoryBase<Task, UUID> {
    
    public List<Task> findByAssigneeId(UUID assigneeId) {
        return list("assignee.id", Sort.by("createdAt").descending(), assigneeId);
    }
    
    public List<Task> findByAssignerId(UUID assignerId) {
        return list("assigner.id", Sort.by("createdAt").descending(), assignerId);
    }
    
    public List<Task> findByStatus(TaskStatus status) {
        return list("status", Sort.by("createdAt").descending(), status);
    }
    
    public List<Task> findByAssigneeIdAndStatus(UUID assigneeId, TaskStatus status) {
        return list("assignee.id = ?1 and status = ?2", 
                    Sort.by("createdAt").descending(), 
                    assigneeId, status);
    }
    
    public List<Task> findByAssignerIdAndStatus(UUID assignerId, TaskStatus status) {
        return list("assigner.id = ?1 and status = ?2", 
                    Sort.by("createdAt").descending(), 
                    assignerId, status);
    }
    
    public List<Task> findTasksApproachingDeadline(Instant deadlineThreshold) {
        return list("endTime <= ?1 and status not in ?2",
                    Sort.by("endTime").ascending(),
                    deadlineThreshold,
                    List.of(TaskStatus.DONE, TaskStatus.CANCEL));
    }
    
    public List<Task> findAllPaged(int page, int size) {
        return findAll(Sort.by("createdAt").descending())
                .page(Page.of(page, size))
                .list();
    }
    
    public List<Task> findByAssigneeIdPaged(UUID assigneeId, int page, int size) {
        return find("assignee.id", Sort.by("createdAt").descending(), assigneeId)
                .page(Page.of(page, size))
                .list();
    }
    
    public List<Task> findByAssignerIdPaged(UUID assignerId, int page, int size) {
        return find("assigner.id", Sort.by("createdAt").descending(), assignerId)
                .page(Page.of(page, size))
                .list();
    }
    
    public long countByAssigneeId(UUID assigneeId) {
        return count("assignee.id", assigneeId);
    }
    
    public long countByAssignerId(UUID assignerId) {
        return count("assigner.id", assignerId);
    }
    
    public List<Task> findActiveTasksByAssignee(UUID assigneeId) {
        return list("assignee.id = ?1 and status not in ?2", 
                    Sort.by("endTime").ascending(),
                    assigneeId, 
                    List.of(TaskStatus.DONE, TaskStatus.CANCEL));
    }
}
