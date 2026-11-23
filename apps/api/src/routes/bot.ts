/**
 * Bot Routes
 * CRUD operations for WhatsApp bots
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../services/database';

const router = Router();

// Validation schemas
const createBotSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  greetingMessage: z.string().optional(),
  facebookMessengerPageId: z.string().optional(),
});

/**
 * Create a new bot
 * POST /api/bots
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createBotSchema.parse(req.body);
    const userId = (req as any).user.userId;

    const result = await db.query(
      `INSERT INTO bots (id, user_id, name, description, greeting_message,
                         facebook_messenger_page_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        uuidv4(),
        userId,
        data.name,
        data.description,
        data.greetingMessage,
        data.facebookMessengerPageId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

/**
 * Get all bots for user
 * GET /api/bots
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const result = await db.query(
      'SELECT * FROM bots WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
});

/**
 * Get bot by ID
 * GET /api/bots/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await db.query(
      'SELECT * FROM bots WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bot' });
  }
});

/**
 * Update bot
 * PATCH /api/bots/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const { name, description, greetingMessage } = req.body;

    const result = await db.query(
      `UPDATE bots
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           greeting_message = COALESCE($3, greeting_message),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [name, description, greetingMessage, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

/**
 * Delete bot
 * DELETE /api/bots/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    await db.query(
      'DELETE FROM bots WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});

export { router as botRouter };