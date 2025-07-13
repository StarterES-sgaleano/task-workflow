# Database Schema - Phase 1

## Overview

The database schema is designed to support the core functionality of Phase 1 while being extensible for future phases. It uses PostgreSQL with Row Level Security (RLS) for complete data isolation between users.

## Schema Design Principles

- **User Isolation**: All data is isolated per user via RLS policies
- **Unified Items**: Tasks and documents share the same table structure
- **Extensibility**: JSONB metadata fields for future feature additions
- **Audit Trail**: Complete activity logging for all user actions
- **Performance**: Proper indexing for common query patterns

## Core Tables

### 1. User Profiles (extends auth.users)

```sql
-- Extended user profiles (supplements Supabase auth.users)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Projects

```sql
-- Projects for organizing work
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL CHECK (char_length(name) <= 100),
  description text,
  color text DEFAULT '#3b82f6',
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_active ON projects(user_id, is_archived);
```

### 3. Items (Unified Tasks and Documents)

```sql
-- Custom types
CREATE TYPE item_type AS ENUM ('task', 'document');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

-- Unified items table for tasks and documents
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  project_id uuid REFERENCES projects,
  type item_type NOT NULL,
  title text NOT NULL CHECK (char_length(title) <= 200),
  content text DEFAULT '',
  status task_status, -- NULL for documents, required for tasks
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_task_status CHECK (
    (type = 'task' AND status IS NOT NULL) OR 
    (type = 'document' AND status IS NULL)
  )
);

-- RLS Policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own items" ON items
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_user_type ON items(user_id, type);
CREATE INDEX idx_items_user_project ON items(user_id, project_id);
CREATE INDEX idx_items_user_status ON items(user_id, status) WHERE status IS NOT NULL;
CREATE INDEX idx_items_updated_at ON items(updated_at DESC);
CREATE INDEX idx_items_content_search ON items USING gin(to_tsvector('english', title || ' ' || content));
```

### 4. Mentions (Item Relationships)

```sql
-- Mention relationships between items
CREATE TABLE mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  source_item_id uuid REFERENCES items ON DELETE CASCADE,
  target_item_id uuid REFERENCES items ON DELETE CASCADE,
  mention_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Prevent self-references and duplicates
  CONSTRAINT no_self_mention CHECK (source_item_id != target_item_id),
  CONSTRAINT unique_mention UNIQUE (source_item_id, target_item_id)
);

-- RLS Policies
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mentions" ON mentions
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_mentions_source ON mentions(source_item_id);
CREATE INDEX idx_mentions_target ON mentions(target_item_id);
CREATE INDEX idx_mentions_user_id ON mentions(user_id);
```

### 5. Activity Log

```sql
-- Activity log for audit trail
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  item_id uuid REFERENCES items ON DELETE CASCADE,
  action text NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed'
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_item_id ON activity_log(item_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);
```

## Database Functions

### 1. Update Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at 
  BEFORE UPDATE ON items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Activity Logging

```sql
-- Function to log item activities
CREATE OR REPLACE FUNCTION log_item_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (user_id, item_id, action, details)
    VALUES (NEW.user_id, NEW.id, 'created', row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (user_id, item_id, action, details)
    VALUES (NEW.user_id, NEW.id, 'updated', 
      jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (user_id, item_id, action, details)
    VALUES (OLD.user_id, OLD.id, 'deleted', row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply activity logging to items
CREATE TRIGGER log_items_activity
  AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW EXECUTE FUNCTION log_item_activity();
```

## Data Migration Strategy

### Initial Setup
1. Create custom types (enums)
2. Create tables in dependency order
3. Enable RLS on all tables
4. Create RLS policies
5. Create indexes for performance
6. Create functions and triggers

### Sample Data for Development
```sql
-- Sample user profile (after auth user is created)
INSERT INTO profiles (id, username, full_name) 
VALUES (auth.uid(), 'developer', 'Solo Developer');

-- Sample project
INSERT INTO projects (user_id, name, description, color)
VALUES (auth.uid(), 'Personal Tasks', 'My personal task management', '#3b82f6');

-- Sample items
INSERT INTO items (user_id, project_id, type, title, content, status)
VALUES 
  (auth.uid(), (SELECT id FROM projects WHERE name = 'Personal Tasks'), 'task', 'Set up development environment', 'Install Node.js, set up Supabase, configure project', 'todo'),
  (auth.uid(), (SELECT id FROM projects WHERE name = 'Personal Tasks'), 'document', 'Project Notes', 'Initial thoughts and requirements for the app', NULL);
```

## Performance Considerations

### Query Optimization
- All queries automatically filtered by user_id via RLS
- Composite indexes for common query patterns
- Full-text search index on item content
- Proper foreign key constraints for referential integrity

### Scaling Considerations
- Connection pooling via Supabase
- Read replicas for future scaling
- Partitioning strategies for large datasets
- Archive strategies for old data

## Backup and Recovery

### Automated Backups
- Daily automated backups via Supabase
- Point-in-time recovery capability
- Cross-region backup replication
- Backup verification and testing

### Data Export
- User data export functionality
- GDPR compliance for data portability
- JSON format for easy data migration
- Incremental export capabilities
