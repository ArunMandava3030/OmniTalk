/**
 * Webhook Routes
 * Handles incoming webhooks from Meta (WhatsApp)
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';

import { db } from '../services/database';
import { redis } from '../services/redis';
import { processWhatsAppMessage } from '../services/whatsappProcessor';

const router = Router();

/**
 * Webhook verification endpoint
 * GET /webhook - Meta verifies the endpoint
 */
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'omnitalk_webhook_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge as string);
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
});

/**
 * Handle incoming webhook messages
 * POST /webhook - Meta sends messages here
 */
router.post('/', async (req: Request, res: Response) => {
  // Verify signature
  const signature = req.headers['x-hub-signature-256'] as string;
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature)) {
    console.warn('Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    // Handle WhatsApp messages
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages' && change.value.messages) {
          for (const message of change.value.messages) {
            await processIncomingMessage(message, change.value);
          }
        }

        // Handle message status updates
        if (change.field === 'messages' && change.value.statuses) {
          for (const status of change.value.statuses || []) {
            await processMessageStatus(status);
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.status(200).send('OK');
  }
});

/**
 * Verify webhook signature
 */
function verifySignature(payload: string, signature: string): boolean {
  const SIGNING_KEY = process.env.META_APP_SECRET || 'secret';
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', SIGNING_KEY)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(message: any, value: any): Promise<void> {
  const { id, from, to, type, contacts, captions, text, attachments } = message;

  // Get bot associated with this phone number
  const botResult = await db.query(
    'SELECT * FROM bots WHERE whatsapp_phone_number_id = $1',
    [to]
  );

  if (botResult.rows.length === 0) {
    console.warn(`No bot found for phone number ${to}`);
    return;
  }

  const bot = botResult.rows[0];

  // Get conversation context
  const sessionId = `session:${from}:${bot.id}`;
  const context = await redis.get(sessionId);
  const conversationState = context ? JSON.parse(context) : {
    steps: [],
    currentStep: 'start',
    variables: {},
  };

  // Process message based on flow
  const messageData = {
    id,
    from,
    to,
    type,
    text: text?.body,
    attachments,
    contacts,
    captions,
    bot,
    conversationState,
  };

  // Add to message queue for processing
  await redis.lpush('message_queue', JSON.stringify(messageData));

  // Process asynchronously
  processWhatsAppMessage(messageData).catch(console.error);
}

/**
 * Process message status updates
 */
async function processMessageStatus(status: any): Promise<void> {
  const { id, status: messageStatus, timestamp } = status;

  await db.query(
    'UPDATE messages SET status = $1, updated_at = NOW() WHERE external_id = $2',
    [messageStatus, id]
  );
}

export { router as webhookRouter };