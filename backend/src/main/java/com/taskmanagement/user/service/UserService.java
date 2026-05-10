package com.taskmanagement.user.service;

import com.taskmanagement.user.dto.UserDto;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.mapper.UserMapper;
import com.taskmanagement.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

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
        return userRepository.listAll().stream()
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
}
