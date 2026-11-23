/**
 * OmniTalk API Server
 * Main entry point for the WhatsApp Business API integration platform
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { setupRoutes } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { initializeDatabase } from './services/database';
import { initializeRedis } from './services/redis';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication middleware for API routes
app.use('/api', authenticate);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (room: string) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Initialize services
async function initializeServices(): Promise<void> {
  try {
    await initializeDatabase();
    console.log('✅ Database connected');

    await initializeRedis();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001;

initializeServices().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 OmniTalk API server running on port ${PORT}`);
  });
});

export { app, server, io };