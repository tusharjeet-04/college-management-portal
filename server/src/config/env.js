import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET', 'MONGO_URI'];

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_portal',
  jwtSecret: process.env.JWT_SECRET || 'dev_only_insecure_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@college.edu',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
};

export function assertProductionConfig() {
  if (config.nodeEnv !== 'production') return;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`,
    );
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters in production');
  }
}

export default config;
