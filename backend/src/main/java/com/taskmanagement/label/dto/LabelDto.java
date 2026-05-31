package com.taskmanagement.label.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabelDto {
    private UUID id;
    private String name;
    private String color;
}
