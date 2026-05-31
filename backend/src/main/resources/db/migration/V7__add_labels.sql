CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_label_map (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

INSERT INTO labels (name, color) VALUES
    ('Bug', '#ef4444'),
    ('Feature', '#6366f1'),
    ('Hotfix', '#f97316'),
    ('Review', '#eab308'),
    ('Documentation', '#14b8a6'),
    ('Testing', '#22c55e');
