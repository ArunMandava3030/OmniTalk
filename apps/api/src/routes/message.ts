/**
 * Message Routes
 * API for sending and retrieving messages
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../services/database';
import { whatsappService } from '../services/whatsappService';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  to: z.string(),
  type: z.enum(['text', 'image', 'video', 'template', 'interactive']),
  content: z.any().optional(),
  botId: z.string().uuid(),
});

/**
 * Send a message
 * POST /api/messages
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = sendMessageSchema.parse(req.body);
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

    // Save message to database
    const messageId = uuidv4();
    const externalId = await whatsappService.sendMessage(
      data.to,
      data.type,
      data.content
    );

    await db.query(
      `INSERT INTO messages (id, bot_id, from_number, to_number, type, content,
                             external_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent', NOW())`,
      [
        messageId,
        botId,
        process.env.BOT_PHONE_NUMBER,
        data.to,
        data.type,
        JSON.stringify(data.content),
        externalId,
      ]
    );

    res.status(201).json({
      id: messageId,
      externalId,
      status: 'sent',
      to: data.to,
      type: data.type,
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

/**
 * Get messages for a bot
 * GET /api/messages
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const userId = (req as any).user.userId;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verify bot belongs to user
    const botResult = await db.query(
      'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
      [botId, userId]
    );

    if (botResult.rows.length === 0) {
      return res.status(403).json({ error: 'Bot not found or access denied' });
    }

    const result = await db.query(
      `SELECT * FROM messages
       WHERE bot_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [botId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export { router as messageRouter };