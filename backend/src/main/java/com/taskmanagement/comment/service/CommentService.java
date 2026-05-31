package com.taskmanagement.comment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.comment.dto.CommentDto;
import com.taskmanagement.comment.entity.TaskComment;
import com.taskmanagement.comment.repository.CommentRepository;
import com.taskmanagement.comment.websocket.WebSocketRoomManager;
import com.taskmanagement.common.exception.ResourceNotFoundException;
import com.taskmanagement.task.repository.TaskRepository;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class CommentService {

    private static final Logger LOG = Logger.getLogger(CommentService.class);

    @Inject
    CommentRepository commentRepository;

    @Inject
    TaskRepository taskRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    WebSocketRoomManager roomManager;

    @Inject
    ObjectMapper objectMapper;

    public List<CommentDto> getComments(UUID taskId) {
        return commentRepository.findByTaskId(taskId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(UUID taskId, String content, UUID authorId) {
        var task = taskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        User author = userRepository.findByIdOptional(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authorId));

        TaskComment comment = TaskComment.builder()
                .task(task)
                .author(author)
                .content(content.trim())
                .build();
        commentRepository.persist(comment);

        CommentDto dto = toDto(comment);
        broadcastNewComment(taskId.toString(), dto);
        return dto;
    }

    private void broadcastNewComment(String taskId, CommentDto dto) {
        try {
            String json = objectMapper.writeValueAsString(Map.of("type", "NEW_COMMENT", "comment", dto));
            roomManager.broadcast(taskId, json);
        } catch (Exception e) {
            LOG.warnf("Failed to broadcast comment for task %s: %s", taskId, e.getMessage());
        }
    }

    private CommentDto toDto(TaskComment c) {
        return CommentDto.builder()
                .id(c.getId())
                .taskId(c.getTask().getId())
                .authorId(c.getAuthor().getId())
                .authorName(c.getAuthor().getName())
                .authorEmail(c.getAuthor().getEmail())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
