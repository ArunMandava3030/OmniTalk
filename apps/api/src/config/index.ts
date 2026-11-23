/**
 * Configuration
 * Environment configuration management
 */

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  meta: {
    accessToken: string;
    phoneNumberId: string;
    verifyToken: string;
    appSecret: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  frontendUrl: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'omnitalk',
    user: process.env.DB_USER || 'omnitalk',
    password: process.env.DB_PASSWORD || 'password',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN || '',
    phoneNumberId: process.env.META_PHONE_NUMBER_ID || '',
    verifyToken: process.env.META_VERIFY_TOKEN || 'omnitalk_webhook_token',
    appSecret: process.env.META_APP_SECRET || 'secret',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const required = [
    'META_ACCESS_TOKEN',
    'META_PHONE_NUMBER_ID',
    'META_VERIFY_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
}