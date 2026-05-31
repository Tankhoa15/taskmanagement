package com.taskmanagement.user.service;

import com.taskmanagement.common.exception.BusinessException;
import com.taskmanagement.user.dto.UserDto;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.mapper.UserMapper;
import com.taskmanagement.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {
    
    private static final Logger LOG = Logger.getLogger(UserService.class);
    
    @Inject
    UserRepository userRepository;
    
    public Optional<UserDto> findById(UUID id) {
        return userRepository.findByIdOptional(id)
                .map(UserMapper.INSTANCE::toDto);
    }
    
    public Optional<UserDto> findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserMapper.INSTANCE::toDto);
    }
    
    public List<UserDto> findAll() {
        return userRepository.findAllActive().stream()
                .map(UserMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateLastLogin(UUID userId) {
        userRepository.findByIdOptional(userId).ifPresent(user -> {
            user.setLastLoginAt(java.time.Instant.now());
            userRepository.persist(user);
        });
    }

    @Transactional
    public Optional<UserDto> setUserEnabled(UUID targetId, boolean enabled, UUID adminId) {
        return userRepository.findByIdOptional(targetId).map(user -> {
            if (targetId.equals(adminId)) {
                throw new BusinessException("Bạn không thể tự khóa tài khoản của mình", "CANNOT_LOCK_SELF");
            }
            if ("ADMIN".equals(user.getRole())) {
                throw new BusinessException("Không thể khóa tài khoản Admin", "CANNOT_LOCK_ADMIN");
            }
            user.setEnabled(enabled);
            userRepository.persist(user);
            return UserMapper.INSTANCE.toDto(user);
        });
    }

    @Transactional
    public Optional<UserDto> updateUserRole(UUID userId, String role) {
        return userRepository.findByIdOptional(userId).map(user -> {
            user.setRole(role);
            userRepository.persist(user);
            return UserMapper.INSTANCE.toDto(user);
        });
    }

    @Transactional
    public void deleteSelf(UUID userId) {
        User user = userRepository.findByIdOptional(userId)
                .orElseThrow(() -> new BusinessException("User not found", "USER_NOT_FOUND"));
        if (user.getDeletedAt() != null) {
            throw new BusinessException("Tài khoản đã bị xóa", "ALREADY_DELETED");
        }
        // Soft delete: ẩn danh hóa để giữ FK integrity, giải phóng email gốc
        user.setName("Người dùng đã xóa");
        user.setEmail("deleted_" + userId + "@removed.local");
        user.setPasswordHash(null);
        user.setEnabled(false);
        user.setDeletedAt(Instant.now());
        userRepository.persist(user);
        LOG.infof("User %s deleted their account", userId);
    }
}
