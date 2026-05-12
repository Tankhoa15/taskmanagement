package com.taskmanagement.group.dto;

import com.taskmanagement.group.entity.GroupRole;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberDto {
    private UUID userId;
    private String name;
    private String email;
    private GroupRole role;
}
