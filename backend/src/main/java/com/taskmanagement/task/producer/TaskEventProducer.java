package com.taskmanagement.task.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.task.dto.TaskEvent;
import io.smallrye.reactive.messaging.rabbitmq.OutgoingRabbitMQMetadata;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Message;
import org.eclipse.microprofile.reactive.messaging.Metadata;
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
            
            OutgoingRabbitMQMetadata metadata = new OutgoingRabbitMQMetadata.Builder()
                    .withRoutingKey("task." + event.getEventType().toLowerCase())
                    .withContentType("application/json")
                    .build();
            
            Message<String> message = Message.of(json, Metadata.of(metadata));
            emitter.send(message);
            
            LOG.infof("Sent task event: %s for task: %s", event.getEventType(), event.getTaskId());
        } catch (JsonProcessingException e) {
            LOG.errorf(e, "Failed to serialize task event: %s", event);
        }
    }
    
    public void sendToRabbitMQ(String queueName, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            
            OutgoingRabbitMQMetadata metadata = new OutgoingRabbitMQMetadata.Builder()
                    .withRoutingKey(queueName)
                    .withContentType("application/json")
                    .build();
            
            Message<String> message = Message.of(json, Metadata.of(metadata));
            emitter.send(message);
            
            LOG.infof("Sent message to queue: %s", queueName);
        } catch (JsonProcessingException e) {
            LOG.errorf(e, "Failed to serialize message for queue: %s", queueName);
        }
    }
}
