package com.taskmanagement.comment.websocket;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.Session;
import org.jboss.logging.Logger;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class WebSocketRoomManager {

    private static final Logger LOG = Logger.getLogger(WebSocketRoomManager.class);

    private final ConcurrentHashMap<String, Set<Session>> rooms = new ConcurrentHashMap<>();

    public void join(String roomId, Session session) {
        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
        LOG.debugf("Session %s joined room %s (total: %d)", session.getId(), roomId, rooms.get(roomId).size());
    }

    public void leave(String roomId, Session session) {
        Set<Session> room = rooms.get(roomId);
        if (room != null) {
            room.remove(session);
            if (room.isEmpty()) rooms.remove(roomId);
        }
    }

    public void broadcast(String roomId, String message) {
        Set<Session> room = rooms.getOrDefault(roomId, Set.of());
        for (Session s : room) {
            if (s.isOpen()) {
                s.getAsyncRemote().sendText(message);
            }
        }
    }
}
