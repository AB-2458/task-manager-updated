-- ============================================
-- Task Manager - Enable Row Level Security
-- ============================================
-- This migration enables RLS on all user-data tables.
-- RLS MUST be enabled before creating policies.
-- ============================================

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;


-- ============================================
-- IMPORTANT SECURITY NOTE
-- ============================================
-- With RLS enabled and no policies defined:
-- - Anonymous users: NO access (denied by default)
-- - Authenticated users: NO access (denied by default)
-- - Service role: FULL access (bypasses RLS)
--
-- Policies must be created to grant access to authenticated users.
-- See: 003_rls_policies.sql
-- ============================================
