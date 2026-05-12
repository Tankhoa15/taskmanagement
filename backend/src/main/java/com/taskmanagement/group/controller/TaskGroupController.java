package com.taskmanagement.group.controller;

import com.taskmanagement.common.response.ApiResponse;
import com.taskmanagement.group.dto.*;
import com.taskmanagement.group.service.TaskGroupService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@Path("/api/groups")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class TaskGroupController {

    private static final Logger LOG = Logger.getLogger(TaskGroupController.class);

    @Inject
    TaskGroupService groupService;

    @Inject
    JsonWebToken jwt;

    @GET
    public Response getMyGroups() {
        UUID userId = extractUserId();
        List<GroupDto> groups = groupService.getMyGroups(userId);
        return Response.ok(ApiResponse.success(groups)).build();
    }

    @POST
    public Response createGroup(@Valid CreateGroupRequest request) {
        UUID userId = extractUserId();
        LOG.infof("Creating group: %s by user: %s", request.getName(), userId);
        GroupDto group = groupService.createGroup(request, userId);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Group created successfully", group))
                .build();
    }

    @GET
    @Path("/{groupId}/members")
    public Response getMembers(@PathParam("groupId") UUID groupId) {
        UUID userId = extractUserId();
        List<GroupMemberDto> members = groupService.getMembers(groupId, userId);
        return Response.ok(ApiResponse.success(members)).build();
    }

    @POST
    @Path("/{groupId}/members")
    public Response addMember(@PathParam("groupId") UUID groupId, @Valid AddGroupMemberRequest request) {
        UUID userId = extractUserId();
        GroupMemberDto member = groupService.addMember(groupId, request, userId);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Group member saved successfully", member))
                .build();
    }

    @PATCH
    @Path("/{groupId}/members/{userId}/role")
    public Response updateMemberRole(
            @PathParam("groupId") UUID groupId,
            @PathParam("userId") UUID targetUserId,
            @Valid UpdateGroupMemberRoleRequest request) {
        UUID userId = extractUserId();
        GroupMemberDto member = groupService.updateMemberRole(groupId, targetUserId, request, userId);
        return Response.ok(ApiResponse.success("Group member role updated successfully", member)).build();
    }

    private UUID extractUserId() {
        return UUID.fromString(jwt.getSubject());
    }
}
