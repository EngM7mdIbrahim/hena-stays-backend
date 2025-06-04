import { ILogger } from '@contracts'
import pino from 'pino'

class LoggerService implements ILogger {
  private readonly logger: pino.Logger
  constructor() {
    this.logger = pino({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    })
  }
  // Maps directly to pino's info log level
  info(message: string): void {
    this.logger.info(message)
  }

  // Maps directly to pino's error log level
  error(message: string): void {
    this.logger.error(message)
  }

  // Maps directly to pino's warn log level
  warn(message: string): void {
    this.logger.warn(message)
  }

  // Maps directly to pino's debug log level
  debug(message: string): void {
    this.logger.debug(message)
  }

  // We'll map verbose to pino's debug (or could create a custom level)
  verbose(message: string): void {
    this.logger.debug(`[VERBOSE] ${message}`)
  }

  // We'll map silly to pino's trace level
  silly(message: string): void {
    this.logger.trace(`[SILLY] ${message}`)
  }

  // Log method could be an alias for info or a general log method
  log(message: string): void {
    this.logger.info(message)
  }

  // Map http to an existing pino level (for example, info or custom)
  http(message: string): void {
    this.logger.info(`[HTTP] ${message}`)
  }

  // Stream function to return the logger's stream
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream(): any {
    return this.logger // return the pino logger stream, which is writable
  }
}

export const loggerService = new LoggerService()
