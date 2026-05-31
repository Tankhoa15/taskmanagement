package com.taskmanagement.label.service;

import com.taskmanagement.common.exception.BusinessException;
import com.taskmanagement.common.exception.ResourceNotFoundException;
import com.taskmanagement.label.dto.CreateLabelRequest;
import com.taskmanagement.label.dto.LabelDto;
import com.taskmanagement.label.entity.Label;
import com.taskmanagement.label.repository.LabelRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class LabelService {

    @Inject
    LabelRepository labelRepository;

    public List<LabelDto> getAllLabels() {
        return labelRepository.findAllSorted().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabelDto createLabel(CreateLabelRequest request) {
        if (labelRepository.existsByName(request.getName())) {
            throw new BusinessException("Label '" + request.getName() + "' already exists", "LABEL_EXISTS");
        }
        Label label = Label.builder()
                .name(request.getName().trim())
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .build();
        labelRepository.persist(label);
        return toDto(label);
    }

    @Transactional
    public void deleteLabel(UUID id) {
        Label label = labelRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Label", "id", id));
        labelRepository.delete(label);
    }

    public LabelDto toDto(Label label) {
        return LabelDto.builder()
                .id(label.getId())
                .name(label.getName())
                .color(label.getColor())
                .build();
    }
}
