package com.taskmanagement.task.dto;

import com.taskmanagement.task.entity.TaskStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskListResponse {
    private List<TaskDto> tasks;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private TaskStatus filterStatus;
}
