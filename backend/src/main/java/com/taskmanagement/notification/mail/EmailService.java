package com.taskmanagement.notification.mail;

import com.taskmanagement.common.constants.MessageConstants;
import com.taskmanagement.task.dto.EmailTaskNotification;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@ApplicationScoped
public class EmailService {
    
    private static final Logger LOG = Logger.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.systemDefault());
    
    @Inject
    Mailer mailer;
    
    @ConfigProperty(name = "task-management.email.enabled", defaultValue = "true")
    boolean emailEnabled;
    
    public void sendTaskCreatedEmail(EmailTaskNotification notification) {
        if (!emailEnabled) {
            LOG.info("Email sending is disabled, skipping task created email");
            return;
        }
        
        String subject = String.format(MessageConstants.TASK_CREATED_SUBJECT, notification.getTaskTitle());
        String body = String.format(
                MessageConstants.TASK_CREATED_BODY,
                notification.getRecipientName(),
                notification.getTaskTitle(),
                notification.getNotificationType(),
                DATE_FORMATTER.format(notification.getDeadline()),
                notification.getContent() != null ? notification.getContent() : "No description"
        );
        
        sendEmail(notification.getRecipientEmail(), subject, body);
    }
    
    public void sendDeadlineWarningEmail(EmailTaskNotification notification) {
        if (!emailEnabled) {
            LOG.info("Email sending is disabled, skipping deadline warning email");
            return;
        }
        
        String subject = String.format(MessageConstants.TASK_DEADLINE_WARNING_SUBJECT, notification.getTaskTitle());
        String body = String.format(
                MessageConstants.TASK_DEADLINE_WARNING_BODY,
                notification.getRecipientName(),
                notification.getTaskTitle(),
                DATE_FORMATTER.format(notification.getDeadline()),
                notification.getMinutesUntilDeadline()
        );
        
        sendEmail(notification.getRecipientEmail(), subject, body);
    }
    
    public void sendTaskDoneEmailToAssignee(EmailTaskNotification notification, String completedBy) {
        if (!emailEnabled) {
            LOG.info("Email sending is disabled, skipping task done email");
            return;
        }
        
        String subject = String.format(MessageConstants.TASK_DONE_SUBJECT, notification.getTaskTitle());
        String body = String.format(
                MessageConstants.TASK_DONE_ASSIGNEE_BODY,
                notification.getRecipientName(),
                notification.getTaskTitle(),
                completedBy
        );
        
        sendEmail(notification.getRecipientEmail(), subject, body);
    }
    
    public void sendTaskDoneEmailToAssigner(EmailTaskNotification notification, String completedBy) {
        if (!emailEnabled) {
            LOG.info("Email sending is disabled, skipping task done email");
            return;
        }
        
        String subject = String.format(MessageConstants.TASK_DONE_SUBJECT, notification.getTaskTitle());
        String body = String.format(
                MessageConstants.TASK_DONE_ASSIGNER_BODY,
                notification.getRecipientName(),
                notification.getTaskTitle(),
                completedBy,
                DATE_FORMATTER.format(Instant.now())
        );
        
        sendEmail(notification.getRecipientEmail(), subject, body);
    }
    
    private void sendEmail(String to, String subject, String body) {
        try {
            Mail mail = Mail.withHtml(to, subject, body);
            mailer.send(mail);
            LOG.infof("Email sent successfully to: %s, subject: %s", to, subject);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send email to: %s, subject: %s", to, subject);
        }
    }
}
