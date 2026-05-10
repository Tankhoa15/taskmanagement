package com.taskmanagement.common.utils;

import java.util.UUID;

public class StringUtils {
    
    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }
    
    public static String truncate(String str, int maxLength) {
        if (str == null) return null;
        if (str.length() <= maxLength) return str;
        return str.substring(0, maxLength) + "...";
    }
    
    public static String formatUuid(UUID uuid) {
        if (uuid == null) return null;
        return uuid.toString();
    }
    
    public static UUID parseUuid(String str) {
        if (isEmpty(str)) return null;
        try {
            return UUID.fromString(str);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
