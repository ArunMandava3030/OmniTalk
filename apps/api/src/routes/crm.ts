/**
 * CRM Integration Routes
 * Customer relationship management integrations
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { crmService } from '../services/crmService';

const router = Router();

// Validation schemas
const addCRMIntegrationSchema = z.object({
  platform: z.enum(['hubspot', 'salesforce', 'zoho', 'pipedrive']),
  apiKey: z.string(),
  apiUrl: z.string().url().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

const upsertContactSchema = z.object({
  botId: z.string().uuid(),
  platform: z.enum(['hubspot', 'salesforce', 'zoho', 'pipedrive']),
  contact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.string().optional(),
    value: z.number().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Add CRM integration
 * POST /api/crm/integrations
 */
router.post('/integrations', async (req: Request, res: Response) => {
  try {
    const data = addCRMIntegrationSchema.parse(req.body);
    const botId = (req as any).user.botId || req.body.botId;

    if (!botId) {
      return res.status(400).json({ error: 'Bot ID required' });
    }

    crmService.addIntegration(botId, data);
    res.status(201).json({ message: 'CRM integration added successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add CRM integration' });
  }
});

/**
 * Search contacts
 * GET /api/crm/contacts
 */
router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const botId = (req as any).user.botId;
    const platform = req.query.platform as string;
    const query = req.query.q as string;

    if (!platform || !query) {
      return res.status(400).json({ error: 'Platform and query parameter required' });
    }

    const contacts = await crmService.searchContacts(botId, platform, query);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search contacts' });
  }
});

/**
 * Create or update contact
 * POST /api/crm/contacts
 */
router.post('/contacts', async (req: Request, res: Response) => {
  try {
    const data = upsertContactSchema.parse(req.body);

    const contact = await crmService.findOrCreateContact(
      data.botId,
      data.platform,
      data.contact
    );

    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create/update contact' });
  }
});

/**
 * Log activity on contact
 * POST /api/crm/contacts/:id/activity
 */
router.post('/contacts/:id/activity', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const botId = (req as any).user.botId;
    const platform = req.body.platform as string;
    const { type, subject, body } = req.body;

    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    await crmService.logActivity(botId, platform, id, {
      type,
      subject,
      body,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

export { router as crmRouter };