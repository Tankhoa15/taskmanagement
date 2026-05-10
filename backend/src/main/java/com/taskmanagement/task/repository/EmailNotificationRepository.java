package com.taskmanagement.task.repository;

import com.taskmanagement.task.entity.EmailNotification;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EmailNotificationRepository implements PanacheRepositoryBase<EmailNotification, UUID> {
    
    public List<EmailNotification> findPendingNotifications() {
        return list("status", EmailNotification.NotificationStatus.PENDING.name());
    }
    
    public List<EmailNotification> findByTaskId(UUID taskId) {
        return list("taskId", taskId);
    }
    
    public List<EmailNotification> findFailedNotifications() {
        return list("status", EmailNotification.NotificationStatus.FAILED.name());
    }
}
