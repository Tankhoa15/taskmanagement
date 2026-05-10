package com.taskmanagement.audit.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.task.dto.TaskEvent;
import io.smallrye.reactive.messaging.kafka.Record;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AuditEventProducer {
    
    private static final Logger LOG = Logger.getLogger(AuditEventProducer.class);
    
    @Inject
    @Channel("task-events-kafka")
    Emitter<Record<String, String>> emitter;
    
    @Inject
    ObjectMapper objectMapper;
    
    public void sendAuditEvent(TaskEvent event) {
        try {
            String key = event.getTaskId().toString();
            String value = objectMapper.writeValueAsString(event);
            
            emitter.send(Record.of(key, value));
            
            LOG.infof("Sent audit event to Kafka: %s for task: %s", event.getEventType(), event.getTaskId());
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send audit event to Kafka for task: %s", event.getTaskId());
        }
    }
}
