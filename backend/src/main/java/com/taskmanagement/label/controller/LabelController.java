package com.taskmanagement.label.controller;

import com.taskmanagement.common.response.ApiResponse;
import com.taskmanagement.label.dto.CreateLabelRequest;
import com.taskmanagement.label.dto.LabelDto;
import com.taskmanagement.label.service.LabelService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.UUID;

@Path("/api/labels")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class LabelController {

    @Inject
    LabelService labelService;

    @GET
    public Response getAllLabels() {
        List<LabelDto> labels = labelService.getAllLabels();
        return Response.ok(ApiResponse.success(labels)).build();
    }

    @POST
    public Response createLabel(@Valid CreateLabelRequest request) {
        LabelDto label = labelService.createLabel(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Label created", label))
                .build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public Response deleteLabel(@PathParam("id") UUID id) {
        labelService.deleteLabel(id);
        return Response.ok(ApiResponse.success("Label deleted", null)).build();
    }
}
