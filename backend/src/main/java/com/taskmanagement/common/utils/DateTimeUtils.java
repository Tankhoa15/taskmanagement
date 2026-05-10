package com.taskmanagement.common.utils;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {
    
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.systemDefault());
    
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd")
            .withZone(ZoneId.systemDefault());
    
    private static final DateTimeFormatter TIME_ONLY_FORMATTER = DateTimeFormatter
            .ofPattern("HH:mm:ss")
            .withZone(ZoneId.systemDefault());
    
    public static String format(Instant instant) {
        if (instant == null) return null;
        return DEFAULT_FORMATTER.format(instant);
    }
    
    public static String formatDate(Instant instant) {
        if (instant == null) return null;
        return DATE_ONLY_FORMATTER.format(instant);
    }
    
    public static String formatTime(Instant instant) {
        if (instant == null) return null;
        return TIME_ONLY_FORMATTER.format(instant);
    }
    
    public static Instant parse(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.isEmpty()) return null;
        return Instant.parse(dateTimeString);
    }
}
