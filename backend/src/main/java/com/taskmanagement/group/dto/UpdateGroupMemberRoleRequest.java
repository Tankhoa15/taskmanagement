package com.taskmanagement.group.dto;

import com.taskmanagement.group.entity.GroupRole;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateGroupMemberRoleRequest {
    @NotNull(message = "Role is required")
    private GroupRole role;
}
