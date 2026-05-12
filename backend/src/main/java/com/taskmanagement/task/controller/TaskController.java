package com.taskmanagement.task.controller;

import com.taskmanagement.common.response.ApiResponse;
import com.taskmanagement.task.dto.*;
import com.taskmanagement.task.service.TaskService;
import com.taskmanagement.user.entity.User;
import com.taskmanagement.user.repository.UserRepository;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@Path("/api/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class TaskController {
    
    private static final Logger LOG = Logger.getLogger(TaskController.class);
    
    @Inject
    TaskService taskService;
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    UserRepository userRepository;
    
    @POST
    public Response createTask(@Valid CreateTaskRequest request) {
        UUID assignerId = extractUserId();
        LOG.infof("Creating task for user: %s", assignerId);
        
        TaskDto task = taskService.createTask(request, assignerId);
        
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Task created successfully", task))
                .build();
    }
    
    @GET
    @Path("/{id}")
    public Response getTaskById(@PathParam("id") UUID taskId) {
        UUID userId = extractUserId();
        LOG.infof("Getting task: %s by user: %s", taskId, userId);
        
        TaskDto task = taskService.getTaskById(taskId, userId);
        
        return Response.ok(ApiResponse.success(task)).build();
    }
    
    @GET
    @Path("/my")
    public Response getMyTasks() {
        UUID userId = extractUserId();
        LOG.infof("Getting tasks for user: %s", userId);
        
        List<TaskDto> tasks = taskService.getMyTasks(userId);
        
        return Response.ok(ApiResponse.success(tasks)).build();
    }
    
    @GET
    @Path("/assigned")
    public Response getMyAssignedTasks() {
        UUID userId = extractUserId();
        LOG.infof("Getting assigned tasks for user: %s", userId);
        
        List<TaskDto> tasks = taskService.getTasksByAssignee(userId);
        
        return Response.ok(ApiResponse.success(tasks)).build();
    }
    
    @GET
    @Path("/created")
    public Response getMyCreatedTasks() {
        UUID userId = extractUserId();
        LOG.infof("Getting created tasks for user: %s", userId);
        
        List<TaskDto> tasks = taskService.getTasksByAssigner(userId);
        
        return Response.ok(ApiResponse.success(tasks)).build();
    }
    
    @PUT
    @Path("/{id}")
    public Response updateTask(@PathParam("id") UUID taskId, @Valid UpdateTaskRequest request) {
        UUID userId = extractUserId();
        LOG.infof("Updating task: %s by user: %s", taskId, userId);
        
        TaskDto task = taskService.updateTask(taskId, request, userId);
        
        return Response.ok(ApiResponse.success("Task updated successfully", task)).build();
    }
    
    @PATCH
    @Path("/{id}/status")
    public Response updateTaskStatus(@PathParam("id") UUID taskId, @Valid UpdateTaskStatusRequest request) {
        UUID userId = extractUserId();
        LOG.infof("Updating task status: %s to %s by user: %s", taskId, request.getStatus(), userId);
        
        TaskDto task = taskService.updateTaskStatus(taskId, request, userId);
        
        return Response.ok(ApiResponse.success("Task status updated successfully", task)).build();
    }
    
    @PATCH
    @Path("/{id}/assign")
    public Response assignTask(@PathParam("id") UUID taskId, @QueryParam("assigneeId") UUID assigneeId) {
        UUID assignerId = extractUserId();
        LOG.infof("Assigning task: %s to: %s by: %s", taskId, assigneeId, assignerId);
        
        TaskDto task = taskService.assignTask(taskId, assigneeId, assignerId);
        
        return Response.ok(ApiResponse.success("Task assigned successfully", task)).build();
    }
    
    private UUID extractUserId() {
        String userIdStr = jwt.getSubject();
        return UUID.fromString(userIdStr);
    }
}
