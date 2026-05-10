package com.taskmanagement.user.mapper;

import com.taskmanagement.user.dto.UserDto;
import com.taskmanagement.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "cdi")
public interface UserMapper {
    
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    
    @Mapping(target = "id", expression = "java(user.getId())")
    @Mapping(target = "email", expression = "java(user.getEmail())")
    @Mapping(target = "name", expression = "java(user.getName())")
    @Mapping(target = "pictureUrl", expression = "java(user.getPictureUrl())")
    @Mapping(target = "role", expression = "java(user.getRole())")
    @Mapping(target = "enabled", expression = "java(user.getEnabled())")
    @Mapping(target = "createdAt", expression = "java(user.getCreatedAt())")
    @Mapping(target = "lastLoginAt", expression = "java(user.getLastLoginAt())")
    UserDto toDto(User user);
    
    List<UserDto> toDtoList(List<User> users);
}
