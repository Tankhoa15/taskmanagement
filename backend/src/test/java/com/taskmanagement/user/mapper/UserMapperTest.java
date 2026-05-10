package com.taskmanagement.user.mapper;

import com.taskmanagement.user.dto.UserDto;
import com.taskmanagement.user.entity.User;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {
    
    @Test
    void testToDto() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .name("Test User")
                .pictureUrl("https://example.com/pic.jpg")
                .role("USER")
                .enabled(true)
                .createdAt(Instant.now())
                .lastLoginAt(Instant.now())
                .build();
        
        UserDto dto = UserMapper.INSTANCE.toDto(user);
        
        assertNotNull(dto);
        assertEquals(user.getId(), dto.getId());
        assertEquals(user.getEmail(), dto.getEmail());
        assertEquals(user.getName(), dto.getName());
        assertEquals(user.getRole(), dto.getRole());
        assertEquals(user.getEnabled(), dto.getEnabled());
    }
    
    @Test
    void testToDtoNull() {
        UserDto dto = UserMapper.INSTANCE.toDto(null);
        
        assertNull(dto);
    }
}
