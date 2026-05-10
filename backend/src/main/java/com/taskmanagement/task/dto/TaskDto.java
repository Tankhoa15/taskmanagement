package com.taskmanagement.task.dto;

import com.taskmanagement.task.entity.TaskPriority;
import com.taskmanagement.task.entity.TaskStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    private UUID id;
    private String title;
    private String content;
    private Integer point;
    private TaskPriority priority;
    private TaskStatus status;
    private Instant startTime;
    private Instant endTime;
    private UUID assignerId;
    private String assignerName;
    private String assignerEmail;
    private UUID assigneeId;
    private String assigneeName;
    private String assigneeEmail;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant completedAt;
    private Instant cancelledAt;
    private String cancelReason;
}
