package com.taskmanagement.user.dto;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private UUID id;
    private String email;
    private String name;
    private String pictureUrl;
    private String role;
    private Boolean enabled;
    private Instant createdAt;
    private Instant lastLoginAt;
}
