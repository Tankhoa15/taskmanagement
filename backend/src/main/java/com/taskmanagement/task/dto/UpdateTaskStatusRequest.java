package com.taskmanagement.task.dto;

import com.taskmanagement.task.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskStatusRequest {
    
    @NotNull(message = "Status is required")
    private TaskStatus status;
    
    private String cancelReason;
}
