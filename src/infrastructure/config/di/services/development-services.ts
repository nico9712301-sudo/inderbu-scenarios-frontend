import { injectable } from 'inversify';

/**
 * Console Logger for Development
 * 
 * Enhanced logging service for development environment with:
 * - Colored output
 * - Request/response logging
 * - Performance timing
 * - Debug context
 */
@injectable()
export class DevelopmentLogger {
  private readonly colors = {
    info: '\x1b[36m',    // Cyan
    warn: '\x1b[33m',    // Yellow  
    error: '\x1b[31m',   // Red
    success: '\x1b[32m', // Green
    debug: '\x1b[90m',   // Gray
    reset: '\x1b[0m',    // Reset
  };

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = this.formatTimestamp();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: any): void {
    const formatted = this.formatMessage('info', message, context);
    console.log(`${this.colors.info}${formatted}${this.colors.reset}`);
  }

  warn(message: string, context?: any): void {
    const formatted = this.formatMessage('warn', message, context);
    console.warn(`${this.colors.warn}${formatted}${this.colors.reset}`);
  }

  error(message: string, error?: any, context?: any): void {
    const formatted = this.formatMessage('error', message, context);
    console.error(`${this.colors.error}${formatted}${this.colors.reset}`);
    
    if (error) {
      console.error(`${this.colors.error}Error Details:`, error, `${this.colors.reset}`);
    }
  }

  success(message: string, context?: any): void {
    const formatted = this.formatMessage('success', message, context);
    console.log(`${this.colors.success}${formatted}${this.colors.reset}`);
  }

  debug(message: string, context?: any): void {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, context);
      console.log(`${this.colors.debug}${formatted}${this.colors.reset}`);
    }
  }

  /**
   * Log HTTP request details
   */
  logRequest(method: string, url: string, body?: any): void {
    this.info(`HTTP ${method.toUpperCase()} ${url}`, {
      method,
      url,
      hasBody: !!body,
      bodySize: body ? JSON.stringify(body).length : 0,
    });
    
    if (body && process.env.DEBUG_HTTP_BODY === 'true') {
      this.debug('Request Body:', body);
    }
  }

  /**
   * Log HTTP response details
   */
  logResponse(method: string, url: string, status: number, responseTime?: number): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'success';
    const message = `HTTP ${method.toUpperCase()} ${url} - ${status}`;
    const context = {
      method,
      url,
      status,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    if (level === 'error') {
      this.error(message, null, context);
    } else if (level === 'warn') {
      this.warn(message, context);
    } else {
      this.success(message, context);
    }
  }

  /**
   * Log use case execution
   */
  logUseCase(useCaseName: string, input?: any, executionTime?: number): void {
    this.info(`UseCase: ${useCaseName}`, {
      useCase: useCaseName,
      hasInput: !!input,
      executionTime: executionTime ? `${executionTime}ms` : undefined,
    });
    
    if (input && process.env.DEBUG_USE_CASES === 'true') {
      this.debug(`UseCase Input (${useCaseName}):`, input);
    }
  }

  /**
   * Log dependency injection container events
   */
  logContainer(event: string, details?: any): void {
    this.debug(`Container: ${event}`, details);
  }

  /**
   * Performance timer utility
   */
  startTimer(label: string): () => void {
    const start = Date.now();
    this.debug(`Timer started: ${label}`);
    
    return () => {
      const duration = Date.now() - start;
      this.debug(`Timer completed: ${label} (${duration}ms)`);
      return duration;
    };
  }
}

/**
 * Development HTTP Client with Enhanced Logging
 * 
 * Wraps the regular HTTP client with development-specific features:
 * - Request/response logging
 * - Performance monitoring
 * - Error details
 * - Request/response body inspection
 */
@injectable()
export class DevelopmentHttpClient {
  constructor(private logger: DevelopmentLogger) {}

  // TODO: Implement when base HTTP client interface is available
  // This would wrap the regular HTTP client with enhanced logging
  
  /**
   * Example of how this would work:
   */
  // async request<T>(method: string, url: string, options?: any): Promise<T> {
  //   const timer = this.logger.startTimer(`HTTP ${method} ${url}`);
  //   
  //   try {
  //     this.logger.logRequest(method, url, options?.body);
  //     
  //     const response = await this.baseHttpClient.request<T>(method, url, options);
  //     
  //     const duration = timer();
  //     this.logger.logResponse(method, url, 200, duration);
  //     
  //     return response;
  //   } catch (error: any) {
  //     const duration = timer();
  //     this.logger.logResponse(method, url, error.status || 500, duration);
  //     this.logger.error(`HTTP ${method} ${url} failed`, error);
  //     throw error;
  //   }
  // }
}

/**
 * Development Container Health Monitor
 * 
 * Monitors container health and provides detailed diagnostics
 */
@injectable()
export class DevelopmentContainerMonitor {
  constructor(private logger: DevelopmentLogger) {}

  /**
   * Monitor container startup and log health status
   */
  monitorContainerHealth(container: any): void {
    try {
      if (typeof container.getHealthStatus === 'function') {
        const health = container.getHealthStatus();
        
        if (health.status === 'healthy') {
          this.logger.success('Container health check passed', {
            boundDependencies: health.boundDependencies,
            criticalDependenciesOk: health.criticalDependenciesOk,
          });
        } else {
          this.logger.error('Container health check failed', health.error, {
            boundDependencies: health.boundDependencies,
            criticalDependenciesOk: health.criticalDependenciesOk,
          });
        }
      }
    } catch (error) {
      this.logger.error('Failed to check container health', error);
    }
  }

  /**
   * Log container binding details
   */
  logContainerBindings(container: any): void {
    try {
      if (typeof container.getContainerSnapshot === 'function') {
        const snapshot = container.getContainerSnapshot();
        this.logger.debug('Container Bindings:', { snapshot });
      }
    } catch (error) {
      this.logger.error('Failed to get container snapshot', error);
    }
  }
}
