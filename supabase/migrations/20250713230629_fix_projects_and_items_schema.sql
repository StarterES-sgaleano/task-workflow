-- Add missing columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON public.projects 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix items table enum values
-- First check if the old enum exists and update accordingly
DO $$
BEGIN
    -- Create the new enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
    END IF;
    
    -- Add new columns to items if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'title') THEN
        ALTER TABLE public.items ADD COLUMN title text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'content') THEN
        ALTER TABLE public.items ADD COLUMN content text DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'metadata') THEN
        ALTER TABLE public.items ADD COLUMN metadata jsonb DEFAULT '{}';
    END IF;
    
    -- Update existing items to have proper title (copy from name if exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'name') THEN
        UPDATE public.items SET title = name WHERE title IS NULL;
        -- Drop the old name column
        ALTER TABLE public.items DROP COLUMN name;
    END IF;
    
    -- Make title required after copying data
    ALTER TABLE public.items ALTER COLUMN title SET NOT NULL;
    
    -- Update status column to use new enum
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'status') THEN
        -- Update status column to use new enum type, converting old values
        ALTER TABLE public.items 
        ALTER COLUMN status TYPE task_status USING 
          CASE 
            WHEN status::text = 'open' THEN 'todo'::task_status
            WHEN status::text = 'closed' THEN 'done'::task_status
            ELSE 'todo'::task_status
          END;
    ELSE
        -- Add status column if it doesn't exist
        ALTER TABLE public.items ADD COLUMN status task_status DEFAULT 'todo';
    END IF;
    
    -- Set default value for status
    ALTER TABLE public.items ALTER COLUMN status SET DEFAULT 'todo'::task_status;
    
END $$;

-- Create trigger for items updated_at
DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to add missing columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Create trigger for profiles updated_at  
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix activity_log table structure
ALTER TABLE public.activity_log
ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}';

-- Drop the old item_status enum if it exists and is not being used
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_status') THEN
        DROP TYPE item_status;
    END IF;
END $$;
