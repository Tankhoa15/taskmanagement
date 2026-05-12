package com.taskmanagement.task.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.task.dto.TaskEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.jboss.logging.Logger;

@ApplicationScoped
public class TaskEventProducer {
    
    private static final Logger LOG = Logger.getLogger(TaskEventProducer.class);
    
    @Inject
    @Channel("task-events-out")
    Emitter<String> emitter;
    
    @Inject
    ObjectMapper objectMapper;
    
    public void sendTaskEvent(TaskEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            Message<String> message = Message.of(json);
            emitter.send(message);
            LOG.infof("Sent task event: %s for task: %s", event.getEventType(), event.getTaskId());
        } catch (JsonProcessingException e) {
            LOG.errorf(e, "Failed to serialize task event: %s", event);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to publish task event: %s", event);
        }
    }
    
    public void sendToRabbitMQ(String queueName, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            Message<String> message = Message.of(json);
            emitter.send(message);
            LOG.infof("Sent message to queue: %s", queueName);
        } catch (JsonProcessingException e) {
            LOG.errorf(e, "Failed to serialize message for queue: %s", queueName);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to publish message to queue: %s", queueName);
        }
    }
}
