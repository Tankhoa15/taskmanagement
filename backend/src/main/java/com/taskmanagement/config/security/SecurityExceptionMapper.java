package com.taskmanagement.config.security;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import io.quarkus.security.UnauthorizedException;

@Provider
public class SecurityExceptionMapper implements ExceptionMapper<UnauthorizedException> {
    
    private static final Logger LOG = Logger.getLogger(SecurityExceptionMapper.class);

    @Override
    public Response toResponse(UnauthorizedException exception) {
        LOG.warnf("Unauthorized access attempt: %s", exception.getMessage());
        return Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"success\":false,\"message\":\"Unauthorized: " + exception.getMessage() + "\"}")
                .build();
    }
}
