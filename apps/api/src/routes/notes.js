/**
 * Notes Routes
 * 
 * Handles all note-related API endpoints.
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
 * GET /notes
 * 
 * Returns all notes belonging to the authenticated user.
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.userId; // From verified JWT - TRUSTED

  const { data: notes, error } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch notes',
    });
  }

  res.json({
    success: true,
    data: notes,
    count: notes.length,
  });
}));

/**
 * GET /notes/:id
 * 
 * Returns a single note by ID.
 * Only returns the note if it belongs to the authenticated user.
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const noteId = req.params.id;

  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId) // Ensure user owns this note
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Note not found',
      });
    }
    console.error('Error fetching note:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch note',
    });
  }

  res.json({
    success: true,
    data: note,
  });
}));

/**
 * POST /notes
 * 
 * Creates a new note for the authenticated user.
 * 
 * Request body:
 * - content: string (required) - The note content
 * 
 * SECURITY: user_id is set from JWT, not from request body
 */
router.post('/', asyncHandler(async (req, res) => {
  const userId = req.userId; // From verified JWT - TRUSTED
  const { content } = req.body;

  // Validate input
  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content is required and must be a string',
    });
  }

  if (content.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content cannot be empty',
    });
  }

  if (content.length > 10000) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content must be less than 10000 characters',
    });
  }

  // Create the note
  // SECURITY: user_id comes from JWT, not request body
  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .insert({
      user_id: userId, // TRUSTED - from JWT
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to create note',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
}));

/**
 * PATCH /notes/:id
 * 
 * Updates an existing note.
 * Only allows updating notes owned by the authenticated user.
 * 
 * Request body:
 * - content: string - The note content
 */
router.patch('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const noteId = req.params.id;
  const { content } = req.body;

  // Validate input
  if (content === undefined) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content is required',
    });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content must be a string',
    });
  }

  if (content.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content cannot be empty',
    });
  }

  if (content.length > 10000) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Content must be less than 10000 characters',
    });
  }

  // Update the note
  const { data: note, error } = await supabaseAdmin
    .from('notes')
    .update({ content: content.trim() })
    .eq('id', noteId)
    .eq('user_id', userId) // Ensure user owns this note
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Note not found',
      });
    }
    console.error('Error updating note:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to update note',
    });
  }

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
}));

/**
 * DELETE /notes/:id
 * 
 * Deletes a note.
 * Only allows deleting notes owned by the authenticated user.
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const noteId = req.params.id;

  // First check if note exists and belongs to user
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('notes')
    .select('id')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();

  if (checkError || !existing) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Note not found',
    });
  }

  // Delete the note
  const { error } = await supabaseAdmin
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to delete note',
    });
  }

  res.json({
    success: true,
    message: 'Note deleted successfully',
  });
}));

export default router;
