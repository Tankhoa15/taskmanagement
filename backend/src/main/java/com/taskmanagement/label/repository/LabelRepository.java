package com.taskmanagement.label.repository;

import com.taskmanagement.label.entity.Label;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class LabelRepository implements PanacheRepositoryBase<Label, UUID> {

    public List<Label> findAllSorted() {
        return list("order by name asc");
    }

    public boolean existsByName(String name) {
        return count("lower(name) = lower(?1)", name) > 0;
    }
}
