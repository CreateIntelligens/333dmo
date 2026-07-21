import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3100', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  apiKey: process.env.API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
