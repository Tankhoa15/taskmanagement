package com.taskmanagement.auth.service;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class JwtServiceTest {
    
    @Test
    void testGenerateToken() {
        JwtService jwtService = new JwtService();
        
        String token = jwtService.generateToken("user-123", "test@example.com", "USER");
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }
    
    @Test
    void testExtractUserId() {
        JwtService jwtService = new JwtService();
        
        String userId = jwtService.extractUserId("invalid-token");
        
        assertNull(userId);
    }
}
