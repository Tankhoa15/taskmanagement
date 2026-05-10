package com.taskmanagement.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.taskmanagement.auth.dto.AuthResponse;
import com.taskmanagement.auth.dto.GoogleAuthRequest;
import com.taskmanagement.user.service.UserService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AuthService {
    
    private static final Logger LOG = Logger.getLogger(AuthService.class);
    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
    private static final String GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
    
    @ConfigProperty(name = "quarkus.oidc.client-id")
    String clientId;
    
    @Inject
    UserService userService;
    
    @Inject
    JwtService jwtService;
    
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        LOG.infof("Authenticating Google token for user");
        
        String email = verifyGoogleToken(request.getGoogleToken());
        
        JsonNode userInfo = getGoogleUserInfo(request.getGoogleToken());
        
        String name = userInfo.has("name") ? userInfo.get("name").asText() : "";
        String pictureUrl = userInfo.has("picture") ? userInfo.get("picture").asText() : "";
        String googleId = userInfo.has("id") ? userInfo.get("id").asText() : "";
        
        var userDto = userService.createOrUpdateFromGoogle(email, name, pictureUrl, googleId);
        
        String accessToken = jwtService.generateToken(userDto.getId().toString(), email, "USER");
        
        LOG.infof("Successfully authenticated user: %s", email);
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .email(email)
                .name(name)
                .pictureUrl(pictureUrl)
                .build();
    }
    
    private String verifyGoogleToken(String token) {
        try {
            Client client = ClientBuilder.newClient();
            Response response = client.target(GOOGLE_TOKEN_INFO_URL)
                    .queryParam("id_token", token)
                    .request(MediaType.APPLICATION_JSON)
                    .get();
            
            if (response.getStatus() != 200) {
                LOG.errorf("Google token verification failed with status: %d", response.getStatus());
                throw new RuntimeException("Invalid Google token");
            }
            
            String jsonResponse = response.readEntity(String.class);
            JsonNode jsonNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(jsonResponse);
            
            String email = jsonNode.get("email").asText();
            String aud = jsonNode.get("aud").asText();
            
            if (!aud.equals(clientId)) {
                LOG.errorf("Token audience mismatch: expected %s, got %s", clientId, aud);
                throw new RuntimeException("Invalid token audience");
            }
            
            return email;
        } catch (Exception e) {
            LOG.error("Error verifying Google token", e);
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }
    
    private JsonNode getGoogleUserInfo(String accessToken) {
        try {
            Client client = ClientBuilder.newClient();
            Response response = client.target(GOOGLE_USER_INFO_URL)
                    .request(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + accessToken)
                    .get();
            
            if (response.getStatus() != 200) {
                LOG.errorf("Failed to get Google user info with status: %d", response.getStatus());
                throw new RuntimeException("Failed to get user info from Google");
            }
            
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .readTree(response.readEntity(String.class));
        } catch (Exception e) {
            LOG.error("Error getting Google user info", e);
            throw new RuntimeException("Failed to get user info: " + e.getMessage());
        }
    }
}
