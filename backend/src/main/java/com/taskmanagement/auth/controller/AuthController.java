package com.taskmanagement.auth.controller;

import com.taskmanagement.auth.dto.AuthResponse;
import com.taskmanagement.auth.dto.LoginRequest;
import com.taskmanagement.auth.dto.RegisterRequest;
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
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        LOG.infof("Received registration request");
        
        AuthResponse response = authService.register(request);
        
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Registration successful", response))
                .build();
    }

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        LOG.infof("Received login request");

        AuthResponse response = authService.login(request);

        return Response.ok(ApiResponse.success("Authentication successful", response)).build();
    }
}
