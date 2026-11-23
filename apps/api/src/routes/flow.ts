/**
 * Flow Routes
 * Conversation flow management for WhatsApp automations
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../services/database';

const router = Router();

// Validation schemas
const createFlowSchema = z.object({
  botId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  triggerType: z.enum(['message', 'keyword', 'event', 'schedule']),
  triggerData: z.record<any>().optional(),
});

/**
 * Create a new flow
 * POST /api/flows
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createFlowSchema.parse(req.body);
    const botId = data.botId;
    const userId = (req as any).user.userId;

    // Verify bot belongs to user
    const botResult = await db.query(
      'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
      [botId, userId]
    );

    if (botResult.rows.length === 0) {
      return res.status(403).json({ error: 'Bot not found or access denied' });
    }

    const result = await db.query(
      `INSERT INTO flows (
        id, bot_id, name, description, trigger_type, trigger_data,
        nodes, edges, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, '{}'::jsonb, '{}'::jsonb, true, NOW(), NOW())
      RETURNING *`,
      [
        uuidv4(),
        botId,
        data.name,
        data.description,
        data.triggerType,
        JSON.stringify(data.triggerData || {}),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create flow' });
  }
});

/**
 * Get flows for a bot
 * GET /api/flows
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const userId = (req as any).user.userId;

    const result = await db.query(
      `SELECT * FROM flows WHERE bot_id = $1 AND (
        SELECT user_id FROM bots WHERE id = $1
      ) = $2 ORDER BY created_at DESC`,
      [botId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

/**
 * Get flow by ID
 * GET /api/flows/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await db.query(
      `SELECT f.* FROM flows f
       JOIN bots b ON f.bot_id = b.id
       WHERE f.id = $1 AND b.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flow' });
  }
});

/**
 * Update flow
 * PATCH /api/flows/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const { name, description, nodes, edges, isActive } = req.body;

    const result = await db.query(
      `UPDATE flows
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           nodes = COALESCE($3::jsonb, nodes),
           edges = COALESCE($4::jsonb, edges),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       FROM bots
       WHERE flows.id = $6 AND bots.id = flows.bot_id AND bots.user_id = $7
       RETURNING *`,
      [name, description, JSON.stringify(nodes), JSON.stringify(edges), isActive, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update flow' });
  }
});

/**
 * Delete flow
 * DELETE /api/flows/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    await db.query(
      `DELETE FROM flows
       WHERE id = $1 AND EXISTS (
         SELECT 1 FROM bots WHERE id = flows.bot_id AND user_id = $2
       )`,
      [id, userId]
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

/**
 * Execute flow
 * POST /api/flows/:id/execute
 */
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, context } = req.body;

    // This would trigger the flow execution engine
    // For now, just return the flow data
    const result = await db.query(
      `SELECT f.*, json_build_object(
        'executedAt', NOW(),
        'context', $2
      ) as execution
       FROM flows f
       WHERE f.id = $1 AND f.is_active = true`,
      [id, JSON.stringify(context || {})]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute flow' });
  }
});

export { router as flowRouter };