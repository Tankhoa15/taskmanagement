package com.taskmanagement.common.exception;

import com.taskmanagement.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.stream.Collectors;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {
    
    private static final Logger LOG = Logger.getLogger(GlobalExceptionHandler.class);

    @Override
    public Response toResponse(Exception exception) {
        LOG.error("Exception caught: ", exception);
        
        if (exception instanceof BusinessException businessException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(businessException.getMessage(), businessException.getErrorCode()))
                    .build();
        }
        
        if (exception instanceof ResourceNotFoundException notFoundException) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error(notFoundException.getMessage(), "RESOURCE_NOT_FOUND"))
                    .build();
        }
        
        if (exception instanceof UnauthorizedException unauthorizedException) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error(unauthorizedException.getMessage(), "UNAUTHORIZED"))
                    .build();
        }
        
        if (exception instanceof ConstraintViolationException validationException) {
            String errors = validationException.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(errors, "VALIDATION_ERROR"))
                    .build();
        }
        
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(ApiResponse.error("Internal server error", "INTERNAL_ERROR"))
                .build();
    }
}
