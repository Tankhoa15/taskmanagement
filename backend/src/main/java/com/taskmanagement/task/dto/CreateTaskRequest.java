package com.taskmanagement.task.dto;

import com.taskmanagement.task.entity.TaskPriority;
import com.taskmanagement.task.entity.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTaskRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    private String content;
    
    @Min(value = 0, message = "Point must be non-negative")
    @Max(value = 100, message = "Point must not exceed 100")
    private Integer point = 0;
    
    private TaskPriority priority = TaskPriority.MEDIUM;
    
    @NotNull(message = "Start time is required")
    private Instant startTime;
    
    @NotNull(message = "End time is required")
    private Instant endTime;
    
    @NotNull(message = "Assignee ID is required")
    private UUID assigneeId;

    @NotNull(message = "Group ID is required")
    private UUID groupId;
}
