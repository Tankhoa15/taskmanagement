package com.taskmanagement.comment.repository;

import com.taskmanagement.comment.entity.TaskComment;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CommentRepository implements PanacheRepositoryBase<TaskComment, UUID> {

    public List<TaskComment> findByTaskId(UUID taskId) {
        return list("task.id = ?1 order by createdAt asc", taskId);
    }
}
