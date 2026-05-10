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
public class UpdateTaskRequest {
    
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    private String content;
    
    @Min(value = 0, message = "Point must be non-negative")
    @Max(value = 100, message = "Point must not exceed 100")
    private Integer point;
    
    private TaskPriority priority;
    
    private Instant startTime;
    
    private Instant endTime;
    
    private UUID assigneeId;
    
    private String cancelReason;
}
