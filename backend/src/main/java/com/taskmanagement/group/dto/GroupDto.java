package com.taskmanagement.group.dto;

import com.taskmanagement.group.entity.GroupRole;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDto {
    private UUID id;
    private String name;
    private UUID ownerId;
    private String ownerName;
    private String ownerEmail;
    private GroupRole currentUserRole;
    private Instant createdAt;
}
