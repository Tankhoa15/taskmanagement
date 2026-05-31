package com.taskmanagement.task.dto;

import com.taskmanagement.label.dto.LabelDto;
import com.taskmanagement.task.entity.TaskPriority;
import com.taskmanagement.task.entity.TaskStatus;
import lombok.*;

import java.time.Instant;
import java.util.List;
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
    private UUID groupId;
    private String groupName;
    private List<LabelDto> labels;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant completedAt;
    private Instant cancelledAt;
    private String cancelReason;
}
