package com.taskmanagement.task.mapper;

import com.taskmanagement.label.dto.LabelDto;
import com.taskmanagement.label.entity.Label;
import com.taskmanagement.task.dto.TaskDto;
import com.taskmanagement.task.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "cdi")
public interface TaskMapper {

    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    @Mapping(target = "id", expression = "java(task.getId())")
    @Mapping(target = "title", expression = "java(task.getTitle())")
    @Mapping(target = "content", expression = "java(task.getContent())")
    @Mapping(target = "point", expression = "java(task.getPoint())")
    @Mapping(target = "priority", expression = "java(task.getPriority())")
    @Mapping(target = "status", expression = "java(task.getStatus())")
    @Mapping(target = "startTime", expression = "java(task.getStartTime())")
    @Mapping(target = "endTime", expression = "java(task.getEndTime())")
    @Mapping(target = "assignerId", expression = "java(task.getAssigner() != null ? task.getAssigner().getId() : null)")
    @Mapping(target = "assignerName", expression = "java(task.getAssigner() != null ? task.getAssigner().getName() : null)")
    @Mapping(target = "assignerEmail", expression = "java(task.getAssigner() != null ? task.getAssigner().getEmail() : null)")
    @Mapping(target = "assigneeId", expression = "java(task.getAssignee() != null ? task.getAssignee().getId() : null)")
    @Mapping(target = "assigneeName", expression = "java(task.getAssignee() != null ? task.getAssignee().getName() : null)")
    @Mapping(target = "assigneeEmail", expression = "java(task.getAssignee() != null ? task.getAssignee().getEmail() : null)")
    @Mapping(target = "groupId", expression = "java(task.getGroup() != null ? task.getGroup().getId() : null)")
    @Mapping(target = "groupName", expression = "java(task.getGroup() != null ? task.getGroup().getName() : null)")
    @Mapping(target = "labels", expression = "java(mapLabels(task.getLabels()))")
    @Mapping(target = "createdAt", expression = "java(task.getCreatedAt())")
    @Mapping(target = "updatedAt", expression = "java(task.getUpdatedAt())")
    @Mapping(target = "completedAt", expression = "java(task.getCompletedAt())")
    @Mapping(target = "cancelledAt", expression = "java(task.getCancelledAt())")
    @Mapping(target = "cancelReason", expression = "java(task.getCancelReason())")
    TaskDto toDto(Task task);

    List<TaskDto> toDtoList(List<Task> tasks);

    default List<LabelDto> mapLabels(Set<Label> labels) {
        if (labels == null || labels.isEmpty()) return Collections.emptyList();
        return labels.stream()
                .map(l -> LabelDto.builder().id(l.getId()).name(l.getName()).color(l.getColor()).build())
                .collect(Collectors.toList());
    }
}
