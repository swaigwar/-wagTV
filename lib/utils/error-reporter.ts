/**
 * Error Reporting Service
 * 
 * Provides error reporting functionality for production environments.
 * Integrates with monitoring services and provides error context.
 */

interface ErrorContext {
  userId?: string
  component?: string
  action?: string
  metadata?: Record<string, unknown>
  timestamp?: string
  userAgent?: string
  url?: string
}

interface ErrorReport {
  message: string
  stack?: string
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  fingerprint?: string
}

class ErrorReporter {
  private isProduction: boolean
  private apiEndpoint?: string
  private apiKey?: string
  private maxRetries: number = 3
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.apiEndpoint = process.env.ERROR_REPORTING_ENDPOINT
    this.apiKey = process.env.ERROR_REPORTING_API_KEY
  }

  /**
   * Report an error to the monitoring service
   */
  async reportError(error: Error, context: ErrorContext = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<void> {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      severity,
      fingerprint: this.generateFingerprint(error, context),
    }

    // Log to console in development
    if (!this.isProduction) {
      console.group('🐛 Error Report')
      console.error('Error:', error)
      console.log('Context:', context)
      console.log('Severity:', severity)
      console.groupEnd()
      return
    }

    // Send to monitoring service in production
    if (this.apiEndpoint && this.apiKey) {
      try {
        await this.sendToMonitoringService(errorReport)
      } catch (sendError) {
        // Fallback: log to console if monitoring service fails
        console.error('Failed to send error report:', sendError)
        console.error('Original error:', error)
      }
    }
  }

  /**
   * Report a handled exception (warning level)
   */
  async reportWarning(message: string, context: ErrorContext = {}): Promise<void> {
    const error = new Error(message)
    error.name = 'Warning'
    await this.reportError(error, context, 'low')
  }

  /**
   * Report a critical error that requires immediate attention
   */
  async reportCritical(error: Error, context: ErrorContext = {}): Promise<void> {
    await this.reportError(error, context, 'critical')
  }

  /**
   * Generate a fingerprint for error deduplication
   */
  private generateFingerprint(error: Error, context: ErrorContext): string {
    const components = [
      error.name,
      error.message,
      context.component,
      context.action,
    ].filter(Boolean)
    
    return Buffer.from(components.join('|')).toString('base64').slice(0, 16)
  }

  /**
   * Send error report to monitoring service
   */
  private async sendToMonitoringService(report: ErrorReport): Promise<void> {
    if (!this.apiEndpoint || !this.apiKey) {
      throw new Error('Error reporting not configured')
    }

    let attempt = 0
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(report),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return // Success
      } catch (error) {
        attempt++
        if (attempt >= this.maxRetries) {
          throw error
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  /**
   * Test the error reporting configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      const testError = new Error('Test error report')
      await this.reportError(testError, { component: 'ErrorReporter', action: 'test' }, 'low')
      return true
    } catch (error) {
      console.error('Error reporting test failed:', error)
      return false
    }
  }
}

// Create a singleton instance
const errorReporter = new ErrorReporter()

export default errorReporter
export { ErrorReporter, type ErrorContext, type ErrorReport }