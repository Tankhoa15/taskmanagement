package com.taskmanagement.user.repository;

import com.taskmanagement.user.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {
    
    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
    
    public Optional<User> findByGoogleId(String googleId) {
        return find("googleId", googleId).firstResultOptional();
    }
    
    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
}
