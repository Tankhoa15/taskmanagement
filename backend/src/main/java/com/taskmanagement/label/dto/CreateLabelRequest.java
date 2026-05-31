package com.taskmanagement.label.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateLabelRequest {

    @NotBlank(message = "Label name is required")
    @Size(max = 50, message = "Label name must not exceed 50 characters")
    private String name;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color (e.g. #6366f1)")
    private String color = "#6366f1";
}
