import * as functions from 'firebase-functions';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Structured logger for Firebase Functions
 */
class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: LogContext): void {
    const logData = {
      ...this.context,
      ...data,
      message,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case 'debug':
        functions.logger.debug(message, logData);
        break;
      case 'info':
        functions.logger.info(message, logData);
        break;
      case 'warn':
        functions.logger.warn(message, logData);
        break;
      case 'error':
        functions.logger.error(message, logData);
        break;
    }
  }

  debug(message: string, data?: LogContext): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogContext): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogContext): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogContext): void {
    this.log('error', message, data);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }
}

export const logger = new Logger();
export { Logger };
