package com.taskmanagement.comment.controller;

import com.taskmanagement.comment.dto.CommentDto;
import com.taskmanagement.comment.dto.CreateCommentRequest;
import com.taskmanagement.comment.service.CommentService;
import com.taskmanagement.common.response.ApiResponse;
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

@Path("/api/tasks/{taskId}/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class CommentController {

    private static final Logger LOG = Logger.getLogger(CommentController.class);

    @Inject
    CommentService commentService;

    @Inject
    JsonWebToken jwt;

    @GET
    public Response getComments(@PathParam("taskId") UUID taskId) {
        List<CommentDto> comments = commentService.getComments(taskId);
        return Response.ok(ApiResponse.success(comments)).build();
    }

    @POST
    public Response addComment(@PathParam("taskId") UUID taskId, @Valid CreateCommentRequest request) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        LOG.infof("User %s adding comment to task %s", authorId, taskId);
        CommentDto comment = commentService.addComment(taskId, request.getContent(), authorId);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Comment added", comment))
                .build();
    }
}
