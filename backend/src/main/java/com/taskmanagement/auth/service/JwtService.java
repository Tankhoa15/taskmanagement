package com.taskmanagement.auth.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@ApplicationScoped
public class JwtService {
    
    private static final Logger LOG = Logger.getLogger(JwtService.class);
    
    @ConfigProperty(name = "mp.jwt.verify.publickey.location", defaultValue = "publicKey.pem")
    String publicKeyLocation;
    
    public String generateToken(String userId, String email, String role) {
        LOG.debugf("Generating JWT for user: %s", email);
        
        Set<String> groups = new HashSet<>();
        groups.add(role);
        
        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofHours(24));
        
        return Jwt.issuer("task-management")
                .subject(userId)
                .upn(email)
                .groups(groups)
                .claim("email", email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .sign();
    }
    
    public String extractUserId(String token) {
        try {
            var jwt = io.smallrye.jwt.auth.principal.JWTParser.parse(token);
            return jwt.getSubject();
        } catch (Exception e) {
            LOG.error("Error extracting user ID from token", e);
            return null;
        }
    }
    
    public String extractEmail(String token) {
        try {
            var jwt = io.smallrye.jwt.auth.principal.JWTParser.parse(token);
            return jwt.getClaim("email");
        } catch (Exception e) {
            LOG.error("Error extracting email from token", e);
            return null;
        }
    }
}
