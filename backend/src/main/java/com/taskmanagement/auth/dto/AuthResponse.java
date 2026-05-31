package com.taskmanagement.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private String userId;
    private String email;
    private String name;
    private String pictureUrl;
    private String role;
}
