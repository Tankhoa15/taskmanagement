package com.taskmanagement.task.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.task.dto.EmailTaskNotification;
import com.taskmanagement.task.entity.Task;
import com.taskmanagement.task.repository.TaskRepository;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class DeadlineCheckScheduler {
    
    private static final Logger LOG = Logger.getLogger(DeadlineCheckScheduler.class);
    
    @Inject
    TaskRepository taskRepository;
    
    @Inject
    ObjectMapper objectMapper;
    
    @Inject
    @Channel("task-events-out")
    Emitter<String> emitter;
    
    @ConfigProperty(name = "task-management.scheduler.deadline-check.enabled", defaultValue = "true")
    boolean schedulerEnabled;
    
    @ConfigProperty(name = "task-management.scheduler.deadline-check.warning-before-minutes", defaultValue = "60")
    int warningBeforeMinutes;
    
    @Scheduled(cron = "*/10 * * * * ?", concurrentExecution = Scheduled.ConcurrentExecution.SKIP)
    public void checkDeadlineTasks() {
        if (!schedulerEnabled) {
            LOG.debug("Deadline check scheduler is disabled");
            return;
        }
        
        LOG.info("Running deadline check scheduler");
        
        Instant warningThreshold = Instant.now().plusSeconds(warningBeforeMinutes * 60L);
        List<Task> approachingTasks = taskRepository.findTasksApproachingDeadline(warningThreshold);
        
        LOG.infof("Found %d tasks approaching deadline", approachingTasks.size());
        
        for (Task task : approachingTasks) {
            try {
                sendDeadlineWarning(task);
            } catch (Exception e) {
                LOG.errorf(e, "Failed to send deadline warning for task: %s", task.getId());
            }
        }
    }
    
    private void sendDeadlineWarning(Task task) {
        long minutesUntilDeadline = Duration.between(Instant.now(), task.getEndTime()).toMinutes();
        
        EmailTaskNotification notification = EmailTaskNotification.builder()
                .taskId(task.getId())
                .taskTitle(task.getTitle())
                .recipientEmail(task.getAssignee().getEmail())
                .recipientName(task.getAssignee().getName())
                .notificationType(EmailTaskNotification.EmailType.TASK_DEADLINE_WARNING.name())
                .subject("Task Deadline Warning: " + task.getTitle())
                .deadline(task.getEndTime())
                .minutesUntilDeadline(minutesUntilDeadline)
                .createdAt(Instant.now())
                .build();
        
        try {
            String json = objectMapper.writeValueAsString(notification);
            Message<String> message = Message.of(json);
            emitter.send(message);
            LOG.infof("Sent deadline warning for task: %s to: %s", task.getId(), task.getAssignee().getEmail());
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send deadline warning message for task: %s", task.getId());
        }
    }
}
