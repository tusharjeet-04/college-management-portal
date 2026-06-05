/* Minimal leveled logger to avoid noisy console.* usage across the codebase. */
const timestamp = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`[${timestamp()}] [INFO] ${msg}`),
  warn: (msg) => console.warn(`[${timestamp()}] [WARN] ${msg}`),
  error: (msg) => console.error(`[${timestamp()}] [ERROR] ${msg}`),
};

export default logger;
