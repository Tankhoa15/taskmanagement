package com.taskmanagement.common.constants;

public class MessageConstants {
    
    public static final String TASK_CREATED_SUBJECT = "New Task Assigned: %s";
    public static final String TASK_CREATED_BODY = """
        Hello %s,
        
        You have been assigned a new task:
        
        Title: %s
        Priority: %s
        Deadline: %s
        
        Description:
        %s
        
        Please check your task list for more details.
        
        Best regards,
        Task Management System
        """;
    
    public static final String TASK_DEADLINE_WARNING_SUBJECT = "Task Deadline Warning: %s";
    public static final String TASK_DEADLINE_WARNING_BODY = """
        Hello %s,
        
        This is a reminder that the following task is approaching its deadline:
        
        Title: %s
        Deadline: %s
        Time Remaining: %d minutes
        
        Please complete this task before the deadline.
        
        Best regards,
        Task Management System
        """;
    
    public static final String TASK_DONE_SUBJECT = "Task Completed: %s";
    public static final String TASK_DONE_ASSIGNEE_BODY = """
        Hello %s,
        
        Great job! The following task has been completed:
        
        Title: %s
        Completed by: %s
        
        Best regards,
        Task Management System
        """;
    
    public static final String TASK_DONE_ASSIGNER_BODY = """
        Hello %s,
        
        The task you assigned has been completed:
        
        Title: %s
        Completed by: %s
        Completion Time: %s
        
        Best regards,
        Task Management System
        """;
}
