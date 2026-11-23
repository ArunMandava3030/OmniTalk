/**
 * Database Service
 * PostgreSQL connection and query management
 */

import { Pool } from 'pg';
import { Redis } from 'redis';

// PostgreSQL connection pool
export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'omnitalk',
  user: process.env.DB_USER || 'omnitalk',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client
let redisClient: Redis | null = null;

export async function initializeRedis(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected');
  });

  return redisClient;
}

export { redisClient as redis };

/**
 * Initialize database connections
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const client = await db.connect();
    client.release();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Run migrations
 */
export async function runMigrations(): Promise<void> {
  // This would typically use a migration library like 'pg-migrate'
  // For now, we'll create tables if they don't exist
  const migrations = [
    `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      api_key VARCHAR(255) UNIQUE NOT NULL,
      whatsapp_business_account_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `,
    `
    CREATE TABLE IF NOT EXISTS bots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      greeting_message TEXT,
      facebook_messenger_page_id VARCHAR(255),
      whatsapp_phone_number_id VARCHAR(255),
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
    `,
    `
    CREATE TABLE IF NOT EXISTS flows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      trigger_type VARCHAR(50) NOT NULL,
      trigger_data JSONB,
      nodes JSONB,
      edges JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_flows_bot_id ON flows(bot_id);
    `,
    `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
      from_number VARCHAR(50),
      to_number VARCHAR(50),
      type VARCHAR(50),
      content JSONB,
      external_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_bot_id ON messages(bot_id);
    CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_number);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
    `,
  ];

  for (const migration of migrations) {
    await db.query(migration);
  }

  console.log('Migrations completed');
}

export { db };