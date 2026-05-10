package com.taskmanagement.task.entity;

public enum TaskStatus {
    OPEN,      // Task mới được tạo
    PENDING,   // Task đang chờ xử lý
    PROCESS,   // Task đang được xử lý
    DONE,      // Task đã hoàn thành
    CANCEL     // Task đã bị hủy
}
