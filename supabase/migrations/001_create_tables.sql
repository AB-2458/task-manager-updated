-- ============================================
-- Task Manager - Table Creation Migration
-- ============================================
-- This migration creates the core tables for the Task Manager application.
-- Tables reference auth.users (Supabase's built-in auth table).
-- ============================================

-- ============================================
-- TASKS TABLE
-- ============================================
-- Stores user tasks with completion status
-- Each task belongs to exactly one user

CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster user-specific queries
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

-- Add index for filtering by completion status
CREATE INDEX idx_tasks_completed ON public.tasks(user_id, completed);

-- Add comment for documentation
COMMENT ON TABLE public.tasks IS 'User tasks with completion tracking';
COMMENT ON COLUMN public.tasks.user_id IS 'References auth.users.id - the task owner';
COMMENT ON COLUMN public.tasks.title IS 'Task title/description';
COMMENT ON COLUMN public.tasks.completed IS 'Whether the task is marked as done';


-- ============================================
-- NOTES TABLE
-- ============================================
-- Stores user notes/memos
-- Each note belongs to exactly one user

CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster user-specific queries
CREATE INDEX idx_notes_user_id ON public.notes(user_id);

-- Add comment for documentation
COMMENT ON TABLE public.notes IS 'User notes and memos';
COMMENT ON COLUMN public.notes.user_id IS 'References auth.users.id - the note owner';
COMMENT ON COLUMN public.notes.content IS 'Note content/body text';
