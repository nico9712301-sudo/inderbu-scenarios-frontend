/**
 * Simple Dependency Injection Container
 * 
 * Lightweight custom DI solution (~100 lines) optimized for our needs.
 * Provides the same API as Inversify but with minimal overhead.
 */

export class SimpleContainer {
  private dependencies = new Map<string, () => any>();
  private instances = new Map<string, any>();
  
  /**
   * Bind a dependency to the container
   */
  bind<T>(token: string): Binding<T> {
    return new Binding<T>(token, this.dependencies, this.instances);
  }
  
  /**
   * Get a dependency from the container
   */
  get<T>(token: string): T {
    const factory = this.dependencies.get(token);
    if (!factory) {
      throw new Error(`Dependency '${token}' not registered in container`);
    }
    return factory();
  }
  
  /**
   * Check if a dependency is bound
   */
  isBound(token: string): boolean {
    return this.dependencies.has(token);
  }
  
  /**
   * Get optional dependency (returns undefined if not bound)
   */
  getOptional<T>(token: string): T | undefined {
    if (this.isBound(token)) {
      return this.get<T>(token);
    }
    return undefined;
  }
  
  /**
   * Unbind a dependency (useful for testing)
   */
  unbind(token: string): void {
    this.dependencies.delete(token);
    this.instances.delete(token);
  }
  
  /**
   * Clear all dependencies
   */
  clear(): void {
    this.dependencies.clear();
    this.instances.clear();
  }
  
  /**
   * Get container snapshot for debugging
   */
  getSnapshot(): string {
    const boundServices: string[] = [];
    this.dependencies.forEach((_, token) => {
      const isSingleton = this.instances.has(token);
      boundServices.push(`${token} -> ${isSingleton ? 'Singleton' : 'Transient'}`);
    });
    return `Container Snapshot (${boundServices.length} dependencies):\n${boundServices.join('\n')}`;
  }
}

/**
 * Binding class for fluent API
 */
class Binding<T> {
  constructor(
    private token: string,
    private dependencies: Map<string, () => any>,
    private instances: Map<string, any>
  ) {}
  
  /**
   * Bind to a factory function
   */
  to(factory: () => T): Binding<T> {
    this.dependencies.set(this.token, factory);
    return this;
  }
  
  /**
   * Bind to a constant value
   */
  toConstantValue(value: T): Binding<T> {
    this.dependencies.set(this.token, () => value);
    this.instances.set(this.token, value);
    return this;
  }
  
  /**
   * Make this dependency a singleton
   */
  singleton(): void {
    const originalFactory = this.dependencies.get(this.token);
    if (!originalFactory) {
      throw new Error(`Cannot make ${this.token} singleton: not bound yet`);
    }
    
    this.dependencies.set(this.token, () => {
      if (!this.instances.has(this.token)) {
        this.instances.set(this.token, originalFactory());
      }
      return this.instances.get(this.token);
    });
  }
}

/**
 * Container interface for type safety
 */
export interface IContainer {
  get<T>(token: string): T;
  getOptional<T>(token: string): T | undefined;
  isBound(token: string): boolean;
  bind<T>(token: string): Binding<T>;
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