-- Migration: Add due_date and priority to tasks table
-- Phase 6: Task Features Enhancement

-- Add due_date column (optional, DATE type)
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add priority column with default 'medium'
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Add check constraint for priority values
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));

-- Add index for due_date queries (useful for sorting/filtering)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Add index for priority queries
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Comment the new columns
COMMENT ON COLUMN public.tasks.due_date IS 'Optional due date for the task';
COMMENT ON COLUMN public.tasks.priority IS 'Task priority: low, medium, or high';
