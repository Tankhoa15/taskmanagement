CREATE TABLE task_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES task_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_task_group_members_group_user UNIQUE (group_id, user_id)
);

CREATE INDEX idx_task_group_members_group_id ON task_group_members(group_id);
CREATE INDEX idx_task_group_members_user_id ON task_group_members(user_id);
CREATE INDEX idx_task_group_members_role ON task_group_members(role);

ALTER TABLE tasks ADD COLUMN group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL;
CREATE INDEX idx_tasks_group_id ON tasks(group_id);

INSERT INTO task_groups (id, name, owner_id)
SELECT uuid_generate_v4(), COALESCE(NULLIF(name, ''), email) || '''s group', id
FROM users;

INSERT INTO task_group_members (group_id, user_id, role)
SELECT id, owner_id, 'ADMIN'
FROM task_groups;

UPDATE tasks t
SET group_id = g.id
FROM task_groups g
WHERE g.owner_id = t.assigner_id
  AND t.group_id IS NULL;

INSERT INTO task_group_members (group_id, user_id, role)
SELECT DISTINCT t.group_id, t.assignee_id, 'MEMBER'
FROM tasks t
WHERE t.group_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM task_group_members m
      WHERE m.group_id = t.group_id
        AND m.user_id = t.assignee_id
  );

CREATE TRIGGER update_task_groups_updated_at
    BEFORE UPDATE ON task_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
