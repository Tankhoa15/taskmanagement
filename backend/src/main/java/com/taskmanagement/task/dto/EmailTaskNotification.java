package com.taskmanagement.task.dto;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTaskNotification implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private UUID taskId;
    private String taskTitle;
    private String recipientEmail;
    private String recipientName;
    private String notificationType;
    private String subject;
    private String content;
    private Instant deadline;
    private Long minutesUntilDeadline;
    private Instant createdAt;

    public enum EmailType {
        TASK_CREATED,
        TASK_DEADLINE_WARNING,
        TASK_DONE
    }
}
