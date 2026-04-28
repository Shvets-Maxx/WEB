import pino, { type Logger, type LoggerOptions } from 'pino';

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const options: LoggerOptions = {
  level,
  base: { service: 'eco-monitor', env: process.env.NODE_ENV ?? 'development' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[redacted]',
  },
};

export const logger: Logger = pino(options);

export function childLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
