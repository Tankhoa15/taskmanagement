package com.taskmanagement.user.repository;

import com.taskmanagement.user.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {

    public Optional<User> findByEmail(String email) {
        return find("email = ?1 and deletedAt is null", email).firstResultOptional();
    }

    public boolean existsByEmail(String email) {
        return count("email = ?1 and deletedAt is null", email) > 0;
    }

    public List<User> findAllActive() {
        return list("deletedAt is null order by createdAt desc");
    }
}
