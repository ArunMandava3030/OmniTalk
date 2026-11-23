/**
 * Routes Index
 * Main route setup for OmniTalk API
 */

import { Application } from 'express';
import { authRouter } from './auth';
import { botRouter } from './bot';
import { flowRouter } from './flow';
import { messageRouter } from './message';
import { webhookRouter } from './webhook';
import { analyticsRouter } from './analytics';

export function setupRoutes(app: Application): void {
  // Public routes
  app.use('/api/auth', authRouter);

  // Webhook endpoint (no auth required for Meta verification)
  app.use('/webhook', webhookRouter);

  // Protected routes (require authentication)
  app.use('/api/bots', botRouter);
  app.use('/api/flows', flowRouter);
  app.use('/api/messages', messageRouter);
  app.use('/api/analytics', analyticsRouter);
}