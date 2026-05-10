package com.taskmanagement.common.utils;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class StringUtilsTest {
    
    @Test
    void testIsEmpty() {
        assertTrue(StringUtils.isEmpty(null));
        assertTrue(StringUtils.isEmpty(""));
        assertTrue(StringUtils.isEmpty("   "));
        assertFalse(StringUtils.isEmpty("test"));
    }
    
    @Test
    void testIsNotEmpty() {
        assertFalse(StringUtils.isNotEmpty(null));
        assertFalse(StringUtils.isNotEmpty(""));
        assertTrue(StringUtils.isNotEmpty("test"));
    }
    
    @Test
    void testTruncate() {
        assertEquals("Hello...", StringUtils.truncate("Hello World", 5));
        assertEquals("Hello", StringUtils.truncate("Hello", 10));
        assertNull(StringUtils.truncate(null, 5));
    }
    
    @Test
    void testParseUuid() {
        UUID uuid = UUID.randomUUID();
        
        UUID parsed = StringUtils.parseUuid(uuid.toString());
        
        assertEquals(uuid, parsed);
    }
    
    @Test
    void testParseUuidInvalid() {
        assertNull(StringUtils.parseUuid("invalid-uuid"));
        assertNull(StringUtils.parseUuid(null));
    }
}
