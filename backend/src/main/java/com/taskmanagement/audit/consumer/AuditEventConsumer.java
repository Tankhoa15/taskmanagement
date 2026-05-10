package com.taskmanagement.audit.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.task.dto.TaskEvent;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AuditEventConsumer {
    
    private static final Logger LOG = Logger.getLogger(AuditEventConsumer.class);
    
    @Inject
    ObjectMapper objectMapper;
    
    @Incoming("audit-events")
    @Blocking
    public void consumeAuditEvent(String message) {
        try {
            TaskEvent event = objectMapper.readValue(message, TaskEvent.class);
            
            LOG.infof("Consumed audit event: %s for task: %s by user: %s",
                    event.getEventType(),
                    event.getTaskId(),
                    event.getAssignerId());
            
            // Here you can add additional audit logic like:
            // - Store audit logs to database
            // - Send to external audit service
            // - Generate analytics data
            
        } catch (Exception e) {
            LOG.errorf(e, "Failed to process audit event: %s", message);
        }
    }
}
