package com.taskmanagement.task.service;

import com.taskmanagement.common.exception.BusinessException;
import com.taskmanagement.common.exception.ResourceNotFoundException;
import com.taskmanagement.group.entity.TaskGroup;
import com.taskmanagement.group.repository.TaskGroupRepository;
import com.taskmanagement.group.service.TaskGroupService;
import com.taskmanagement.notification.mail.EmailService;
import com.taskmanagement.task.dto.*;
import com.taskmanagement.task.entity.Task;
import com.taskmanagement.task.entity.TaskHistory;
import com.taskmanagement.task.entity.TaskStatus;
import com.taskmanagement.task.mapper.TaskMapper;
import com.taskmanagement.task.producer.TaskEventProducer;
import com.taskmanagement.task.repository.TaskHistoryRepository;
import com.taskmanagement.task.repository.TaskRepository;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.repository.UserRepository;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class TaskService {
    
    private static final Logger LOG = Logger.getLogger(TaskService.class);
    
    @Inject
    TaskRepository taskRepository;
    
    @Inject
    TaskHistoryRepository taskHistoryRepository;
    
    @Inject
    UserRepository userRepository;

    @Inject
    TaskGroupRepository groupRepository;

    @Inject
    TaskGroupService groupService;
    
    @Inject
    TaskEventProducer taskEventProducer;

    @Inject
    EmailService emailService;
    
    @Transactional
    public TaskDto createTask(CreateTaskRequest request, UUID assignerId) {
        LOG.infof("Creating task: %s by user: %s", request.getTitle(), assignerId);
        
        User assigner = userRepository.findByIdOptional(assignerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", assignerId));
        
        User assignee = userRepository.findByIdOptional(request.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee", "id", request.getAssigneeId()));

        TaskGroup group = groupRepository.findByIdOptional(request.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Group", "id", request.getGroupId()));
        groupService.requireAdmin(group.getId(), assignerId);
        groupService.requireMember(group.getId(), assignee.getId());
        
        validateTaskDates(request.getStartTime(), request.getEndTime());
        
        Task task = Task.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .point(request.getPoint() != null ? request.getPoint() : 0)
                .priority(request.getPriority())
                .status(TaskStatus.OPEN)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .assigner(assigner)
                .assignee(assignee)
                .group(group)
                .build();
        
        taskRepository.persist(task);
        
        saveTaskHistory(task.getId(), assignerId, "TASK_CREATED", null, TaskStatus.OPEN, null, null);
        
        publishTaskCreatedEvent(task);
        sendTaskCreatedEmail(task);
        
        LOG.infof("Task created successfully: %s", task.getId());
        return TaskMapper.INSTANCE.toDto(task);
    }
    
    @Transactional
    public TaskDto updateTask(UUID taskId, UpdateTaskRequest request, UUID userId) {
        LOG.infof("Updating task: %s by user: %s", taskId, userId);
        
        Task task = taskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        requireGroupAdmin(task, userId);
        
        boolean updated = false;
        TaskStatus oldStatus = task.getStatus();
        UUID oldAssigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        UUID newAssigneeId = request.getAssigneeId();
        
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
            updated = true;
        }
        if (request.getContent() != null) {
            task.setContent(request.getContent());
            updated = true;
        }
        if (request.getPoint() != null) {
            task.setPoint(request.getPoint());
            updated = true;
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
            updated = true;
        }
        if (request.getStartTime() != null) {
            task.setStartTime(request.getStartTime());
            updated = true;
        }
        if (request.getEndTime() != null) {
            task.setEndTime(request.getEndTime());
            updated = true;
        }
        if (request.getAssigneeId() != null && !request.getAssigneeId().equals(oldAssigneeId)) {
            User newAssignee = userRepository.findByIdOptional(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee", "id", request.getAssigneeId()));
            task.setAssignee(newAssignee);
            updated = true;
            
            saveTaskHistory(taskId, userId, "TASK_ASSIGNED", oldStatus, task.getStatus(), oldAssigneeId, newAssigneeId);
        }
        
        if (updated) {
            taskRepository.persist(task);
            publishTaskUpdatedEvent(task);
        }
        
        LOG.infof("Task updated successfully: %s", taskId);
        return TaskMapper.INSTANCE.toDto(task);
    }
    
    @Transactional
    public TaskDto updateTaskStatus(UUID taskId, UpdateTaskStatusRequest request, UUID userId) {
        LOG.infof("Updating task status: %s to %s by user: %s", taskId, request.getStatus(), userId);
        
        Task task = taskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        requireStatusPermission(task, userId);
        
        TaskStatus oldStatus = task.getStatus();
        TaskStatus newStatus = request.getStatus();
        
        if (oldStatus == newStatus) {
            throw new BusinessException("Task is already in status: " + newStatus);
        }
        
        if (newStatus == TaskStatus.CANCEL && request.getCancelReason() != null) {
            task.setCancelReason(request.getCancelReason());
            task.setCancelledAt(Instant.now());
        }
        
        if (newStatus == TaskStatus.DONE) {
            task.setCompletedAt(Instant.now());
        }
        
        task.setStatus(newStatus);
        taskRepository.persist(task);
        
        saveTaskHistory(taskId, userId, "STATUS_CHANGED", oldStatus, newStatus, null, null);
        
        if (newStatus == TaskStatus.DONE) {
            publishTaskDoneEvent(task);
            sendTaskDoneEmails(task);
        }
        
        LOG.infof("Task status updated: %s -> %s", oldStatus, newStatus);
        return TaskMapper.INSTANCE.toDto(task);
    }
    
    @Transactional
    public TaskDto assignTask(UUID taskId, UUID assigneeId, UUID assignerId) {
        LOG.infof("Assigning task: %s to user: %s by: %s", taskId, assigneeId, assignerId);
        
        Task task = taskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        requireGroupAdmin(task, assignerId);
        
        User newAssignee = userRepository.findByIdOptional(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignee", "id", assigneeId));
        if (task.getGroup() != null) {
            groupService.requireMember(task.getGroup().getId(), newAssignee.getId());
        }
        
        UUID oldAssigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        task.setAssignee(newAssignee);
        taskRepository.persist(task);
        
        saveTaskHistory(taskId, assignerId, "TASK_REASSIGNED", task.getStatus(), task.getStatus(), oldAssigneeId, assigneeId);
        
        publishTaskAssignedEvent(task);
        
        return TaskMapper.INSTANCE.toDto(task);
    }
    
    public TaskDto getTaskById(UUID taskId, UUID userId) {
        Task task = taskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        requireViewPermission(task, userId);
        return TaskMapper.INSTANCE.toDto(task);
    }
    
    public List<TaskDto> getTasksByAssignee(UUID assigneeId) {
        return taskRepository.findByAssigneeId(assigneeId).stream()
                .map(TaskMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getTasksByAssigner(UUID assignerId) {
        return taskRepository.findByAssignerId(assignerId).stream()
                .map(TaskMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getMyTasks(UUID userId) {
        return taskRepository.findVisibleToUser(userId).stream()
                .map(TaskMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getTasksApproachingDeadline(Instant threshold) {
        return taskRepository.findTasksApproachingDeadline(threshold).stream()
                .map(TaskMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
    
    private void validateTaskDates(Instant startTime, Instant endTime) {
        if (endTime.isBefore(startTime)) {
            throw new BusinessException("End time must be after start time");
        }
    }
    
    private void saveTaskHistory(UUID taskId, UUID userId, String action, 
                                  TaskStatus oldStatus, TaskStatus newStatus,
                                  UUID oldAssigneeId, UUID newAssigneeId) {
        TaskHistory history = TaskHistory.builder()
                .taskId(taskId)
                .userId(userId)
                .action(action)
                .oldStatus(oldStatus != null ? oldStatus.name() : null)
                .newStatus(newStatus != null ? newStatus.name() : null)
                .oldAssigneeId(oldAssigneeId)
                .newAssigneeId(newAssigneeId)
                .build();
        
        taskHistoryRepository.persist(history);
    }

    private void requireGroupAdmin(Task task, UUID userId) {
        if (task.getGroup() == null) {
            if (task.getAssigner().getId().equals(userId)) {
                return;
            }
            throw new BusinessException("Only the task assigner can manage this task", "TASK_ACCESS_DENIED");
        }
        groupService.requireAdmin(task.getGroup().getId(), userId);
    }

    private void requireStatusPermission(Task task, UUID userId) {
        if (task.getAssignee().getId().equals(userId)) {
            return;
        }
        if (task.getGroup() != null && groupService.isAdmin(task.getGroup().getId(), userId)) {
            return;
        }
        throw new BusinessException("You can only update your own tasks unless you are a group admin", "TASK_ACCESS_DENIED");
    }

    private void requireViewPermission(Task task, UUID userId) {
        if (task.getAssignee().getId().equals(userId) || task.getAssigner().getId().equals(userId)) {
            return;
        }
        if (task.getGroup() != null && groupService.isAdmin(task.getGroup().getId(), userId)) {
            return;
        }
        throw new BusinessException("You do not have access to this task", "TASK_ACCESS_DENIED");
    }
    
    private void publishTaskCreatedEvent(Task task) {
        TaskEvent event = TaskEvent.builder()
                .taskId(task.getId())
                .eventType(TaskEvent.EventType.TASK_CREATED.name())
                .title(task.getTitle())
                .content(task.getContent())
                .priority(task.getPriority())
                .status(task.getStatus())
                .startTime(task.getStartTime())
                .endTime(task.getEndTime())
                .assignerId(task.getAssigner().getId())
                .assignerEmail(task.getAssigner().getEmail())
                .assignerName(task.getAssigner().getName())
                .assigneeId(task.getAssignee().getId())
                .assigneeEmail(task.getAssignee().getEmail())
                .assigneeName(task.getAssignee().getName())
                .createdAt(task.getCreatedAt())
                .occurredAt(Instant.now())
                .build();
        
        taskEventProducer.sendTaskEvent(event);
    }
    
    private void publishTaskUpdatedEvent(Task task) {
        TaskEvent event = TaskEvent.builder()
                .taskId(task.getId())
                .eventType(TaskEvent.EventType.TASK_UPDATED.name())
                .title(task.getTitle())
                .priority(task.getPriority())
                .status(task.getStatus())
                .endTime(task.getEndTime())
                .assigneeId(task.getAssignee().getId())
                .assigneeEmail(task.getAssignee().getEmail())
                .occurredAt(Instant.now())
                .build();
        
        taskEventProducer.sendTaskEvent(event);
    }
    
    private void publishTaskAssignedEvent(Task task) {
        TaskEvent event = TaskEvent.builder()
                .taskId(task.getId())
                .eventType(TaskEvent.EventType.TASK_ASSIGNED.name())
                .title(task.getTitle())
                .status(task.getStatus())
                .assignerId(task.getAssigner().getId())
                .assigneeId(task.getAssignee().getId())
                .assigneeEmail(task.getAssignee().getEmail())
                .assigneeName(task.getAssignee().getName())
                .occurredAt(Instant.now())
                .build();
        
        taskEventProducer.sendTaskEvent(event);
    }
    
    private void publishTaskDoneEvent(Task task) {
        TaskEvent event = TaskEvent.builder()
                .taskId(task.getId())
                .eventType(TaskEvent.EventType.TASK_DONE.name())
                .title(task.getTitle())
                .status(task.getStatus())
                .assignerId(task.getAssigner().getId())
                .assignerEmail(task.getAssigner().getEmail())
                .assignerName(task.getAssigner().getName())
                .assigneeId(task.getAssignee().getId())
                .assigneeEmail(task.getAssignee().getEmail())
                .assigneeName(task.getAssignee().getName())
                .completedAt(task.getCompletedAt())
                .occurredAt(Instant.now())
                .build();
        
        taskEventProducer.sendTaskEvent(event);
    }

    private void sendTaskCreatedEmail(Task task) {
        EmailTaskNotification notification = EmailTaskNotification.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .recipientEmail(task.getAssignee().getEmail())
                .recipientName(task.getAssignee().getName())
                .notificationType(task.getPriority().name())
                .content(task.getContent())
                .deadline(task.getEndTime())
                .createdAt(Instant.now())
                .build();

        emailService.sendTaskCreatedEmail(notification);
    }

    private void sendTaskDoneEmails(Task task) {
        String completedBy = task.getAssignee().getName() != null
                ? task.getAssignee().getName()
                : task.getAssignee().getEmail();

        EmailTaskNotification assigneeNotification = EmailTaskNotification.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .recipientEmail(task.getAssignee().getEmail())
                .recipientName(task.getAssignee().getName())
                .createdAt(Instant.now())
                .build();
        emailService.sendTaskDoneEmailToAssignee(assigneeNotification, completedBy);

        EmailTaskNotification assignerNotification = EmailTaskNotification.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .recipientEmail(task.getAssigner().getEmail())
                .recipientName(task.getAssigner().getName())
                .createdAt(Instant.now())
                .build();
        emailService.sendTaskDoneEmailToAssigner(assignerNotification, completedBy);
    }
}
