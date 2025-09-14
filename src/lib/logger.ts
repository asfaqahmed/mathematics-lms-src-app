/**
 * Comprehensive logging system for Mathematics LMS
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  userId?: string
  sessionId?: string
  traceId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
    const timestamp = new Date(entry.timestamp).toISOString()
    const level = levelNames[entry.level]
    const context = entry.context ? `[${entry.context}]` : ''

    return `${timestamp} ${level} ${context} ${entry.message}`
  }

  /**
   * Create log entry
   */
  private createEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      traceId: this.generateTraceId()
    }
  }

  /**
   * Generate unique trace ID
   */
  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  /**
   * Log message if level meets minimum threshold
   */
  private log(entry: LogEntry): void {
    if (entry.level < this.minLevel) return

    const formatted = this.formatLog(entry)

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = entry.level >= LogLevel.ERROR ? 'error'
        : entry.level === LogLevel.WARN ? 'warn'
        : 'log'

      console[consoleMethod](formatted, entry.data || '')
    }

    // In production, send to external logging service
    if (!this.isDevelopment && entry.level >= LogLevel.ERROR) {
      this.sendToExternalLogger(entry)
    }
  }

  /**
   * Send logs to external service (implement as needed)
   */
  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    try {
      // Implement external logging service integration
      // e.g., Sentry, LogRocket, etc.
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: string, data?: any): void {
    this.log(this.createEntry(LogLevel.DEBUG, message, context, data))
  }

  /**
   * Info level logging
   */
  info(message: string, context?: string, data?: any): void {
    this.log(this.createEntry(LogLevel.INFO, message, context, data))
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: string, data?: any): void {
    this.log(this.createEntry(LogLevel.WARN, message, context, data))
  }

  /**
   * Error level logging
   */
  error(message: string, context?: string, data?: any): void {
    this.log(this.createEntry(LogLevel.ERROR, message, context, data))
  }

  /**
   * Fatal level logging
   */
  fatal(message: string, context?: string, data?: any): void {
    this.log(this.createEntry(LogLevel.FATAL, message, context, data))
  }

  /**
   * Log API requests
   */
  apiRequest(method: string, url: string, status?: number, duration?: number): void {
    this.info(
      `API ${method} ${url} ${status ? `- ${status}` : ''} ${duration ? `(${duration}ms)` : ''}`,
      'API',
      { method, url, status, duration }
    )
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, success?: boolean): void {
    this.info(
      `Auth ${event} ${success !== undefined ? (success ? 'SUCCESS' : 'FAILED') : ''}`,
      'AUTH',
      { event, userId, success }
    )
  }

  /**
   * Log user actions
   */
  userAction(action: string, userId: string, data?: any): void {
    this.info(
      `User action: ${action}`,
      'USER',
      { action, userId, ...data }
    )
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(
      `Performance: ${metric} = ${value}${unit}`,
      'PERF',
      { metric, value, unit }
    )
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  fatal: logger.fatal.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  auth: logger.auth.bind(logger),
  userAction: logger.userAction.bind(logger),
  performance: logger.performance.bind(logger)
}