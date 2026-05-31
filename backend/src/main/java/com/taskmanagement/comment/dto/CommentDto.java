package com.taskmanagement.comment.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private UUID id;
    private UUID taskId;
    private UUID authorId;
    private String authorName;
    private String authorEmail;
    private String content;
    private Instant createdAt;
}
