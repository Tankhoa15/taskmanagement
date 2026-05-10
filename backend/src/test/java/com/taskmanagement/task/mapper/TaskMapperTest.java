package com.taskmanagement.task.mapper;

import com.taskmanagement.task.dto.TaskDto;
import com.taskmanagement.task.entity.Task;
import com.taskmanagement.task.entity.TaskPriority;
import com.taskmanagement.task.entity.TaskStatus;
import com.taskmanagement.user.entity.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TaskMapperTest {
    
    @Test
    void testToDto() {
        UUID taskId = UUID.randomUUID();
        UUID assignerId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        
        User assigner = User.builder()
                .id(assignerId)
                .email("assigner@example.com")
                .name("Assigner")
                .build();
        
        User assignee = User.builder()
                .id(assigneeId)
                .email("assignee@example.com")
                .name("Assignee")
                .build();
        
        Instant now = Instant.now();
        
        Task task = Task.builder()
                .id(taskId)
                .title("Test Task")
                .content("Test Content")
                .point(10)
                .priority(TaskPriority.HIGH)
                .status(TaskStatus.OPEN)
                .startTime(now)
                .endTime(now.plusSeconds(3600))
                .assigner(assigner)
                .assignee(assignee)
                .createdAt(now)
                .updatedAt(now)
                .build();
        
        TaskDto dto = TaskMapper.INSTANCE.toDto(task);
        
        assertNotNull(dto);
        assertEquals(taskId, dto.getId());
        assertEquals("Test Task", dto.getTitle());
        assertEquals("Test Content", dto.getContent());
        assertEquals(10, dto.getPoint());
        assertEquals(TaskPriority.HIGH, dto.getPriority());
        assertEquals(TaskStatus.OPEN, dto.getStatus());
        assertEquals(assignerId, dto.getAssignerId());
        assertEquals("Assigner", dto.getAssignerName());
        assertEquals("assigner@example.com", dto.getAssignerEmail());
        assertEquals(assigneeId, dto.getAssigneeId());
        assertEquals("Assignee", dto.getAssigneeName());
        assertEquals("assignee@example.com", dto.getAssigneeEmail());
    }
    
    @Test
    void testToDtoNull() {
        TaskDto dto = TaskMapper.INSTANCE.toDto(null);
        
        assertNull(dto);
    }
}
