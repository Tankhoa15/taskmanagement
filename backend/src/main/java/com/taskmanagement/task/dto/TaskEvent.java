package com.taskmanagement.task.dto;

import com.taskmanagement.task.entity.TaskPriority;
import com.taskmanagement.task.entity.TaskStatus;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private UUID taskId;
    private String eventType;
    private String title;
    private String content;
    private TaskPriority priority;
    private TaskStatus status;
    private Instant startTime;
    private Instant endTime;
    private UUID assignerId;
    private String assignerEmail;
    private String assignerName;
    private UUID assigneeId;
    private String assigneeEmail;
    private String assigneeName;
    private Instant completedAt;
    private Instant createdAt;
    private Instant occurredAt;

    public enum EventType {
        TASK_CREATED,
        TASK_UPDATED,
        TASK_STATUS_CHANGED,
        TASK_ASSIGNED,
        TASK_DEADLINE_WARNING,
        TASK_DONE,
        TASK_CANCELLED
    }
}
