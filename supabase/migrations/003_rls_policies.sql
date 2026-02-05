-- ============================================
-- Task Manager - Row Level Security Policies
-- ============================================
-- This migration creates RLS policies for all tables.
-- All policies use auth.uid() to enforce per-user data isolation.
-- ============================================

-- ============================================
-- TASKS TABLE POLICIES
-- ============================================

-- SELECT: Users can only view their own tasks
CREATE POLICY "Users can view own tasks"
    ON public.tasks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Users can only create tasks for themselves
CREATE POLICY "Users can insert own tasks"
    ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own tasks
CREATE POLICY "Users can update own tasks"
    ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own tasks
CREATE POLICY "Users can delete own tasks"
    ON public.tasks
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ============================================
-- NOTES TABLE POLICIES
-- ============================================

-- SELECT: Users can only view their own notes
CREATE POLICY "Users can view own notes"
    ON public.notes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Users can only create notes for themselves
CREATE POLICY "Users can insert own notes"
    ON public.notes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own notes
CREATE POLICY "Users can update own notes"
    ON public.notes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own notes
CREATE POLICY "Users can delete own notes"
    ON public.notes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ============================================
-- POLICY EXPLANATION
-- ============================================
-- 
-- USING clause:
--   Filters which existing rows can be accessed.
--   Used for SELECT, UPDATE, DELETE operations.
--   Example: USING (auth.uid() = user_id)
--   → Only rows where user_id matches current user are visible
--
-- WITH CHECK clause:
--   Validates new/modified row data.
--   Used for INSERT, UPDATE operations.
--   Example: WITH CHECK (auth.uid() = user_id)
--   → New rows must have user_id matching current user
--
-- TO authenticated:
--   Policy only applies to authenticated users.
--   Anonymous users have no access by default.
--
-- ============================================
