package com.taskmanagement.task.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.notification.mail.EmailService;
import com.taskmanagement.task.dto.EmailTaskNotification;
import com.taskmanagement.task.dto.TaskEvent;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

@ApplicationScoped
public class TaskEventConsumer {
    
    private static final Logger LOG = Logger.getLogger(TaskEventConsumer.class);
    
    @Inject
    ObjectMapper objectMapper;
    
    @Inject
    EmailService emailService;
    
    @Incoming("task-created-email")
    @Blocking
    public void handleTaskCreatedEmail(String message) {
        try {
            LOG.infof("Received task created email message");
            EmailTaskNotification notification = objectMapper.readValue(message, EmailTaskNotification.class);
            emailService.sendTaskCreatedEmail(notification);
        } catch (Exception e) {
            LOG.errorf(e, "Error processing task created email: %s", message);
        }
    }
    
    @Incoming("task-deadline-warning")
    @Blocking
    public void handleDeadlineWarningEmail(String message) {
        try {
            LOG.infof("Received deadline warning email message");
            EmailTaskNotification notification = objectMapper.readValue(message, EmailTaskNotification.class);
            emailService.sendDeadlineWarningEmail(notification);
        } catch (Exception e) {
            LOG.errorf(e, "Error processing deadline warning email: %s", message);
        }
    }
    
    @Incoming("task-done-notification")
    @Blocking
    public void handleTaskDoneNotification(String message) {
        try {
            LOG.infof("Received task done notification message");
            EmailTaskNotification notification = objectMapper.readValue(message, EmailTaskNotification.class);
            
            emailService.sendTaskDoneEmailToAssignee(notification, notification.getRecipientName());
            
            if (notification.getMinutesUntilDeadline() != null) {
                emailService.sendTaskDoneEmailToAssigner(notification, notification.getRecipientName());
            }
        } catch (Exception e) {
            LOG.errorf(e, "Error processing task done notification: %s", message);
        }
    }
    
    @Incoming("task-events-kafka-consumer")
    @Blocking
    public void handleKafkaEvent(String message) {
        try {
            LOG.infof("Received Kafka event: %s", message);
            TaskEvent event = objectMapper.readValue(message, TaskEvent.class);
            LOG.infof("Processed Kafka event: %s for task: %s", event.getEventType(), event.getTaskId());
        } catch (Exception e) {
            LOG.errorf(e, "Error processing Kafka event: %s", message);
        }
    }
}
