import { Container, interfaces } from 'inversify';

/**
 * Base Container Interface
 * 
 * Defines the contract for all dependency injection containers.
 * Provides type-safe dependency resolution.
 */
export interface IContainer {
  /**
   * Get a single instance of a dependency
   */
  get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T;

  /**
   * Get all instances of a dependency (useful for multiple implementations)
   */
  getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[];

  /**
   * Check if a dependency is bound in the container
   */
  isBound(serviceIdentifier: interfaces.ServiceIdentifier): boolean;

  /**
   * Get optional dependency (returns undefined if not bound)
   */
  getOptional<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T | undefined;
}

/**
 * Abstract Base Container
 * 
 * Provides common functionality for all containers.
 * Implements the template method pattern for container configuration.
 */
export abstract class BaseContainer implements IContainer {
  protected container: Container;

  constructor() {
    this.container = new Container({
      defaultScope: 'Transient',  // Default to transient scope
      autobind: true, // Automatically bind injectable classes
    });

    // Template method - subclasses must implement
    this.configureContainer();
    
    // Optional post-configuration hook
    this.onContainerConfigured();
  }

  /**
   * Template method - subclasses must implement their specific configuration
   */
  protected abstract configureContainer(): void;

  /**
   * Hook method - called after container configuration (optional override)
   */
  protected onContainerConfigured(): void {
    // Override in subclasses if needed
  }

  /**
   * Get a single instance of a dependency
   */
  get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    try {
      return this.container.get<T>(serviceIdentifier);
    } catch (error) {
      throw new ContainerResolutionError(
        `Failed to resolve dependency: ${String(serviceIdentifier)}`,
        error
      );
    }
  }

  /**
   * Get all instances of a dependency
   */
  getAll<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
    try {
      return this.container.getAll<T>(serviceIdentifier);
    } catch (error) {
      throw new ContainerResolutionError(
        `Failed to resolve all dependencies: ${String(serviceIdentifier)}`,
        error
      );
    }
  }

  /**
   * Check if a dependency is bound
   */
  isBound(serviceIdentifier: interfaces.ServiceIdentifier): boolean {
    return this.container.isBound(serviceIdentifier);
  }

  /**
   * Get optional dependency
   */
  getOptional<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T | undefined {
    if (this.isBound(serviceIdentifier)) {
      return this.get<T>(serviceIdentifier);
    }
    return undefined;
  }

  /**
   * Unbind a dependency (useful for testing)
   */
  unbind(serviceIdentifier: interfaces.ServiceIdentifier): void {
    if (this.isBound(serviceIdentifier)) {
      this.container.unbind(serviceIdentifier);
    }
  }

  /**
   * Rebind a dependency (useful for testing and environment-specific overrides)
   */
  rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>) {
    return this.container.rebind<T>(serviceIdentifier);
  }

  /**
   * Get container snapshot for debugging
   */
  getContainerSnapshot(): string {
    // Useful for debugging - shows all bound dependencies
    const bindings = this.container.getBindingDictionary();
    const boundServices: string[] = [];

    bindings.traverse((key, value) => {
      boundServices.push(`${String(key)} -> ${value.length} binding(s)`);
    });

    return `Container Snapshot:\n${boundServices.join('\n')}`;
  }
}

/**
 * Custom error for container resolution failures
 */
export class ContainerResolutionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ContainerResolutionError';
    
    if (cause instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Container configuration options
 */
export interface ContainerOptions {
  defaultScope?: interfaces.BindingScope;
  autoBindInjectable?: boolean;
  skipBaseClassChecks?: boolean;
}
