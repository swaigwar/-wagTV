type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  action?: string
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = `[SWAIG TV ${timestamp}] ${level.toUpperCase()}`
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `${prefix}: ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context))
    
    // In production, send to monitoring service
    if (!this.isDevelopment) {
      // TODO: Implement error reporting service
    }
  }
}

export const logger = new Logger()