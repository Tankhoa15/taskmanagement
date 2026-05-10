package com.taskmanagement.auth.controller;

import com.taskmanagement.auth.dto.AuthResponse;
import com.taskmanagement.auth.dto.GoogleAuthRequest;
import com.taskmanagement.auth.service.AuthService;
import com.taskmanagement.common.response.ApiResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {
    
    private static final Logger LOG = Logger.getLogger(AuthController.class);
    
    @Inject
    AuthService authService;
    
    @POST
    @Path("/google")
    public Response authenticateWithGoogle(@Valid GoogleAuthRequest request) {
        LOG.infof("Received Google authentication request");
        
        AuthResponse response = authService.authenticateWithGoogle(request);
        
        return Response.ok(ApiResponse.success("Authentication successful", response)).build();
    }
}
