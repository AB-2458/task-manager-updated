/**
 * Tasks Routes
 * 
 * Handles all task-related API endpoints.
 * All routes are protected by JWT authentication.
 * 
 * SECURITY: user_id is ALWAYS taken from the verified JWT (req.userId)
 * NEVER trust user_id from the request body.
 */

import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /tasks
 * 
 * Returns all tasks belonging to the authenticated user.
 * Uses RLS via user_id filter.
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.userId; // From verified JWT - TRUSTED

  const { data: tasks, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch tasks',
    });
  }

  res.json({
    success: true,
    data: tasks,
    count: tasks.length,
  });
}));

/**
 * GET /tasks/:id
 * 
 * Returns a single task by ID.
 * Only returns the task if it belongs to the authenticated user.
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = req.params.id;

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId) // Ensure user owns this task
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found',
      });
    }
    console.error('Error fetching task:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch task',
    });
  }

  res.json({
    success: true,
    data: task,
  });
}));

/**
 * POST /tasks
 * 
 * Creates a new task for the authenticated user.
 * 
 * Request body:
 * - title: string (required) - The task title
 * - completed: boolean (optional) - Completion status, defaults to false
 * 
 * SECURITY: user_id is set from JWT, not from request body
 */
router.post('/', asyncHandler(async (req, res) => {
  const userId = req.userId; // From verified JWT - TRUSTED
  const { title, completed = false } = req.body;

  // Validate input
  if (!title || typeof title !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title is required and must be a string',
    });
  }

  if (title.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title cannot be empty',
    });
  }

  if (title.length > 500) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Title must be less than 500 characters',
    });
  }

  // Create the task
  // SECURITY: user_id comes from JWT, not request body
  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      user_id: userId, // TRUSTED - from JWT
      title: title.trim(),
      completed: Boolean(completed),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to create task',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
}));

/**
 * PATCH /tasks/:id
 * 
 * Updates an existing task.
 * Only allows updating tasks owned by the authenticated user.
 * 
 * Request body (all optional):
 * - title: string - The task title
 * - completed: boolean - Completion status
 */
router.patch('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = req.params.id;
  const { title, completed } = req.body;

  // Build update object
  const updates = {};

  if (title !== undefined) {
    if (typeof title !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title must be a string',
      });
    }
    if (title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title cannot be empty',
      });
    }
    updates.title = title.trim();
  }

  if (completed !== undefined) {
    updates.completed = Boolean(completed);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'No valid fields to update',
    });
  }

  // Update the task
  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId) // Ensure user owns this task
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Task not found',
      });
    }
    console.error('Error updating task:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to update task',
    });
  }

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
}));

/**
 * DELETE /tasks/:id
 * 
 * Deletes a task.
 * Only allows deleting tasks owned by the authenticated user.
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = req.params.id;

  // First check if task exists and belongs to user
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (checkError || !existing) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Task not found',
    });
  }

  // Delete the task
  const { error } = await supabaseAdmin
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to delete task',
    });
  }

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
}));

export default router;
