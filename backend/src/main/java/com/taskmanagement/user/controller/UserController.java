package com.taskmanagement.user.controller;

import com.taskmanagement.common.response.ApiResponse;
import com.taskmanagement.user.dto.UserDto;
import com.taskmanagement.user.service.UserService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {
    
    private static final Logger LOG = Logger.getLogger(UserController.class);
    
    @Inject
    UserService userService;
    
    @Inject
    JsonWebToken jwt;
    
    @GET
    @Path("/me")
    @Authenticated
    public Response getCurrentUser() {
        UUID userId = extractUserId();
        LOG.infof("Getting current user: %s", userId);
        
        return userService.findById(userId)
                .map(user -> Response.ok(ApiResponse.success(user)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("User not found")).build());
    }
    
    @GET
    @Path("/{id}")
    public Response getUserById(@PathParam("id") UUID userId) {
        LOG.infof("Getting user: %s", userId);
        
        return userService.findById(userId)
                .map(user -> Response.ok(ApiResponse.success(user)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("User not found")).build());
    }
    
    @GET
    @Path("/email/{email}")
    public Response getUserByEmail(@PathParam("email") String email) {
        LOG.infof("Getting user by email: %s", email);
        
        return userService.findByEmail(email)
                .map(user -> Response.ok(ApiResponse.success(user)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND)
                        .entity(ApiResponse.error("User not found")).build());
    }
    
    @GET
    public Response getAllUsers() {
        LOG.info("Getting all users");
        
        List<UserDto> users = userService.findAll();
        
        return Response.ok(ApiResponse.success(users)).build();
    }
    
    private UUID extractUserId() {
        String userIdStr = jwt.getSubject();
        return UUID.fromString(userIdStr);
    }
}
