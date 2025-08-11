import { AlternativeScenarioContainer } from './alternative-scenario.container';
import { TYPES } from '../types';
import { DevelopmentLogger, DevelopmentContainerMonitor } from '../services/development-services';

/**
 * Development Container
 * 
 * Extends the base ScenarioContainer with development-specific configurations:
 * - Enhanced logging and debugging tools
 * - Development-specific services
 * - Non-production optimizations
 */
export class DevelopmentContainer extends AlternativeScenarioContainer {
  
  protected configureContainer(): void {
    // Configure base dependencies first
    super.configureContainer();
    
    // Add development-specific bindings
    this.configureDevelopmentServices();
  }

  /**
   * Configure development-specific services and tools
   */
  private configureDevelopmentServices(): void {
    // Enhanced logging for development
    this.container.bind<DevelopmentLogger>('DevelopmentLogger')
      .to(DevelopmentLogger)
      .inSingletonScope();
    
    // Development container monitor
    this.container.bind<DevelopmentContainerMonitor>('DevelopmentContainerMonitor')
      .to(DevelopmentContainerMonitor)
      .inSingletonScope();
    
    // TODO: Add more development services when available
    // Development-specific HTTP client with detailed logging
    // this.container.bind<IHttpClient>(TYPES.HttpClient)
    //   .to(DevelopmentHttpClient)
    //   .inSingletonScope();
    
    // Mock services for offline development (if needed)
    // this.container.bind<IExternalService>(TYPES.ExternalService)
    //   .to(MockExternalService)
    //   .inSingletonScope();
  }

  protected onContainerConfigured(): void {
    super.onContainerConfigured();
    
    // Development-specific post-configuration
    this.logDevelopmentInfo();
    
    // Monitor container health
    this.monitorContainerHealth();
  }

  /**
   * Log development container information
   */
  private logDevelopmentInfo(): void {
    try {
      const logger = this.container.get<DevelopmentLogger>('DevelopmentLogger');
      
      logger.success('🔧 Development Container initialized', {
        environment: process.env.NODE_ENV,
        debug: process.env.DEBUG,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      });
      
      // Log container health
      const health = this.getHealthStatus();
      if (health.status === 'healthy') {
        logger.info('📊 Container Health: Healthy', {
          boundDependencies: health.boundDependencies,
          criticalDependenciesOk: health.criticalDependenciesOk,
        });
      } else {
        logger.warn('📊 Container Health: Issues detected', {
          error: health.error,
          boundDependencies: health.boundDependencies,
          criticalDependenciesOk: health.criticalDependenciesOk,
        });
      }
      
      // Log all bound dependencies for debugging
      if (process.env.DEBUG_CONTAINER === 'true') {
        logger.debug('📋 Container Dependencies:', {
          snapshot: this.getContainerSnapshot(),
        });
      }
    } catch (error) {
      console.log('🔧 Development Container initialized (basic logging)');
      console.log('⚠️  Could not initialize development logger:', error);
    }
  }

  /**
   * Monitor container health with development tools
   */
  private monitorContainerHealth(): void {
    try {
      const monitor = this.container.get<DevelopmentContainerMonitor>('DevelopmentContainerMonitor');
      monitor.monitorContainerHealth(this);
      
      if (process.env.DEBUG_CONTAINER_BINDINGS === 'true') {
        monitor.logContainerBindings(this);
      }
    } catch (error) {
      console.warn('Could not initialize development container monitor:', error);
    }
  }

  /**
   * Get development logger instance
   */
  getDevelopmentLogger(): DevelopmentLogger {
    return this.container.get<DevelopmentLogger>('DevelopmentLogger');
  }

  /**
   * Get development container monitor
   */
  getDevelopmentMonitor(): DevelopmentContainerMonitor {
    return this.container.get<DevelopmentContainerMonitor>('DevelopmentContainerMonitor');
  }
}
