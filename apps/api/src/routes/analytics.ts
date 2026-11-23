/**
 * Analytics Routes
 * Performance metrics and analytics data
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { db } from '../services/database';

const router = Router();

// Validation schemas
const getAnalyticsSchema = z.object({
  botId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

/**
 * Get analytics overview
 * GET /api/analytics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = getAnalyticsSchema.parse({
      botId: req.query.botId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      groupBy: req.query.groupBy as string,
    });

    const userId = (req as any).user.userId;

    // Verify bot belongs to user
    const botResult = await db.query(
      'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
      [data.botId, userId]
    );

    if (botResult.rows.length === 0) {
      return res.status(403).json({ error: 'Bot not found or access denied' });
    }

    // Get message counts
    const messageStats = await db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
        COUNT(CASE WHEN type = 'text' THEN 1 END) as textMessages,
        COUNT(CASE WHEN type = 'image' THEN 1 END) as images,
        COUNT(CASE WHEN created_at >= $2 THEN 1 END) as recent
       FROM messages
       WHERE bot_id = $1`,
      [data.botId, data.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()]
    );

    // Get event counts
    const eventStats = await db.query(
      `SELECT event_type, COUNT(*) as count
       FROM analytics_events
       WHERE bot_id = $1 AND created_at >= $2
       GROUP BY event_type
       ORDER BY count DESC`,
      [data.botId, data.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()]
    );

    // Get conversion metrics
    const conversionStats = await db.query(
      `SELECT
        COUNT(DISTINCT user_phone) as uniqueUsers,
        COUNT(*) as totalMessages,
        ROUND(AVG(CASE WHEN type = 'text' THEN 1 ELSE 0 END) * 100, 2) as textRate
       FROM messages
       WHERE bot_id = $1 AND created_at >= $2`,
      [data.botId, data.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()]
    );

    res.json({
      messages: messageStats.rows[0],
      events: eventStats.rows,
      conversions: conversionStats.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get messages chart data
 * GET /api/analytics/messages
 */
router.get('/messages', async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const userId = (req as any).user.userId;
    const groupBy = (req.query.groupBy as string) || 'day';
    const days = parseInt(req.query.days as string) || 7;

    // Verify bot belongs to user
    const botResult = await db.query(
      'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
      [botId, userId]
    );

    if (botResult.rows.length === 0) {
      return res.status(403).json({ error: 'Bot not found or access denied' });
    }

    // Get hourly/daily message counts
    const timeFormat = groupBy === 'hour' ? 'SELECT date_trunc(\'hour\', created_at)'
                  : groupBy === 'week' ? 'SELECT date_trunc(\'week\', created_at)'
                  : groupBy === 'month' ? 'SELECT date_trunc(\'month\', created_at)'
                  : 'SELECT date_trunc(\'day\', created_at)';

    const query = `
      WITH time_series AS (
        SELECT generate_series(
          NOW() - INTERVAL '${days} days',
          NOW(),
          INTERVAL '${groupBy === 'hour' ? '1 hour'
                          : groupBy === 'week' ? '1 week'
                          : groupBy === 'month' ? '1 month'
                          : '1 day'}'
        ) AS time_bucket
      )
      SELECT
        time_bucket as x,
        COALESCE(COUNT(m.id), 0) as y
      FROM time_series
      LEFT JOIN messages m ON ${timeFormat}(m.created_at) = time_bucket
      WHERE m.bot_id = $1
      GROUP BY time_bucket
      ORDER BY time_bucket
    `;

    const result = await db.query(query, [botId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch message analytics' });
  }
});

/**
 * Log analytics event
 * POST /api/analytics/events
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { botId, eventType, eventData } = req.body;
    const userId = (req as any).user.userId;
    const userPhone = req.body.userPhone;

    // Verify bot belongs to user
    const botResult = await db.query(
      'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
      [botId, userId]
    );

    if (botResult.rows.length === 0) {
      return res.status(403).json({ error: 'Bot not found or access denied' });
    }

    await db.query(
      `INSERT INTO analytics_events (bot_id, event_type, event_data, user_phone, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [botId, eventType, JSON.stringify(eventData), userPhone]
    );

    res.status(201).json({ message: 'Event logged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log event' });
  }
});

/**
 * Get top conversation paths
 * GET /api/analytics/paths
 */
router.get('/paths', async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const userId = (req as any).user.userId;

    // Verify bot belongs to user
    const botResult = await db.query(
      'SELECT id FROM bots WHERE id = $1 AND user_id = $2',
      [botId, userId]
    );

    if (botResult.rows.length === 0) {
      return res.status(403).json({ error: 'Bot not found or access denied' });
    }

    // Get conversation session data
    const result = await db.query(
      `SELECT
        COUNT(*) as sessions,
        COUNT(DISTINCT user_phone) as uniqueUsers,
        AVG(jsonb_array_length(current_step)) as avgSteps,
        MAX(created_at) as lastActivity
      FROM conversation_sessions
      WHERE bot_id = $1`,
      [botId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch path analytics' });
  }
});

export { router as analyticsRouter };