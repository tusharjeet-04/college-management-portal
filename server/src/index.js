import app from './app.js';
import config, { assertProductionConfig } from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './utils/logger.js';

async function start() {
  assertProductionConfig();
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  const shutdown = (signal) => {
    logger.warn(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
