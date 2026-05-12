-- The application stores task history changes as plain text, not structured JSON.
ALTER TABLE task_history
    ALTER COLUMN changes TYPE TEXT
    USING changes::TEXT;
