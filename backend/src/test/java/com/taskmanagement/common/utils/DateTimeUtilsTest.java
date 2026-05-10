package com.taskmanagement.common.utils;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DateTimeUtilsTest {
    
    @Test
    void testFormat() {
        Instant instant = Instant.parse("2024-01-15T10:30:00Z");
        
        String formatted = DateTimeUtils.format(instant);
        
        assertNotNull(formatted);
        assertTrue(formatted.contains("2024"));
    }
    
    @Test
    void testFormatNull() {
        String formatted = DateTimeUtils.format(null);
        
        assertNull(formatted);
    }
    
    @Test
    void testFormatDate() {
        Instant instant = Instant.parse("2024-01-15T10:30:00Z");
        
        String formatted = DateTimeUtils.formatDate(instant);
        
        assertNotNull(formatted);
        assertTrue(formatted.startsWith("2024-01-15"));
    }
    
    @Test
    void testParse() {
        String dateStr = "2024-01-15T10:30:00Z";
        
        Instant parsed = DateTimeUtils.parse(dateStr);
        
        assertNotNull(parsed);
    }
    
    @Test
    void testParseNull() {
        Instant parsed = DateTimeUtils.parse(null);
        
        assertNull(parsed);
    }
}
