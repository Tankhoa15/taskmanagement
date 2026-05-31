package com.taskmanagement.comment.websocket;

import jakarta.inject.Inject;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.jboss.logging.Logger;

@ServerEndpoint("/ws/task/{taskId}")
public class TaskCommentWebSocket {

    private static final Logger LOG = Logger.getLogger(TaskCommentWebSocket.class);

    @Inject
    WebSocketRoomManager roomManager;

    @OnOpen
    public void onOpen(Session session, @PathParam("taskId") String taskId) {
        roomManager.join(taskId, session);
        LOG.infof("WebSocket opened for task %s", taskId);
    }

    @OnClose
    public void onClose(Session session, @PathParam("taskId") String taskId) {
        roomManager.leave(taskId, session);
        LOG.infof("WebSocket closed for task %s", taskId);
    }

    @OnError
    public void onError(Session session, @PathParam("taskId") String taskId, Throwable t) {
        roomManager.leave(taskId, session);
        LOG.warnf("WebSocket error on task %s: %s", taskId, t.getMessage());
    }

    @OnMessage
    public void onMessage(String message, @PathParam("taskId") String taskId) {
        // client-side ping — no action needed
    }
}
