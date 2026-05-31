package com.taskmanagement.auth.service;

import com.taskmanagement.auth.dto.AuthResponse;
import com.taskmanagement.auth.dto.LoginRequest;
import com.taskmanagement.auth.dto.RegisterRequest;
import com.taskmanagement.common.exception.BusinessException;
import com.taskmanagement.common.exception.UnauthorizedException;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;

@ApplicationScoped
public class AuthService {
    
    private static final Logger LOG = Logger.getLogger(AuthService.class);
    
    @Inject
    UserRepository userRepository;
    
    @Inject
    JwtService jwtService;

    @Inject
    PasswordService passwordService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email already exists", "EMAIL_ALREADY_EXISTS");
        }

        User user = User.builder()
                .email(email)
                .name(request.getName().trim())
                .passwordHash(passwordService.hash(request.getPassword()))
                .role("USER")
                .enabled(true)
                .lastLoginAt(Instant.now())
                .build();

        userRepository.persist(user);
        LOG.infof("Registered user: %s", email);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getDeletedAt() != null) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!Boolean.TRUE.equals(user.getEnabled()) || !passwordService.verify(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.persist(user);
        LOG.infof("Authenticated user: %s", email);

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateToken(user.getId().toString(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .name(user.getName())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole())
                .build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
