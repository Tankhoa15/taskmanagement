package com.taskmanagement.auth.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    
    @Test
    void testGenerateToken() {
        System.setProperty("smallrye.jwt.sign.key.location", "privateKey.pem");
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
