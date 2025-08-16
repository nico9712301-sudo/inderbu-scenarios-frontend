# Architecture Guide

This document outlines key architectural decisions and patterns implemented in the Inderbu Scenarios Frontend application, focusing on Domain-Driven Design (DDD) principles and Clean Architecture.

## Core Architectural Principles

### 1. Domain-Driven Design (DDD) Implementation

#### Entity Business Methods Pattern

**Decision**: Domain entities include specific business methods for state management and validation.

**Rationale**:

- Encapsulates business logic within domain entities
- Provides controlled state modification with validation
- Maintains DDD principles by keeping domain logic in the domain layer

**Implementation**:

```typescript
export class SubScenarioEntity {
  // Query methods for business logic
  isActive(): boolean {
    return this.active;
  }
  isFree(): boolean {
    return !this.hasCost;
  }
  hasImages(): boolean {
    return Boolean(this.imageGallery?.count > 0);
  }

  // Controlled state modification with business validation
  updateActiveStatus(newActiveStatus: boolean): void {
    // Business invariant validation
    // Example: Cannot deactivate if has active reservations
    this.active = newActiveStatus;
    this.updatedAt = new Date();
  }
}
```

**Benefits**:

- Business logic is centralized in domain entities
- State changes are controlled and validated
- Domain invariants are enforced consistently
- Entities remain pure business objects

#### ID-less Entity Creation (DDD Compliance)

**Decision**: Entities can be created without persistence identifiers following DDD principles.

**Rationale**:

- Domain entities should be able to exist independently of persistence
- IDs are technical concerns, not business concerns
- Supports both new entity creation and updates from existing data

**Implementation**:

```typescript
// Factory method for new entities (no ID)
static create(data: CreateEntityData): SubScenarioEntity {
  return new SubScenarioEntity(/* ... */, undefined); // ID is undefined
}

// Factory method from API data (with ID)
static fromApiData(apiData: any): SubScenarioEntity {
  return new SubScenarioEntity(/* ... */, apiData.id);
}
```

### 2. Repository Pattern Enhancements

#### Specialized Repository Methods

**Decision**: Repositories implement domain-specific methods beyond generic CRUD operations.

**Rationale**:

- Different operations have different complexity levels
- Simple operations shouldn't require full entity construction
- Domain methods should be leveraged for business logic

**Implementation**:

```typescript
export interface ISubScenarioRepository {
  // Generic CRUD
  getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios>;
  create(data: Omit<SubScenarioEntity, "id">): Promise<SubScenarioEntity>;
  update(
    id: number,
    data: Partial<SubScenarioEntity>,
  ): Promise<SubScenarioEntity>;

  // Domain-specific operations
  updateActiveStatus(id: number, active: boolean): Promise<SubScenarioEntity>;
}
```

**Benefits**:

- Optimized performance for simple operations
- Clear separation between simple and complex updates
- Domain logic encapsulation maintained
- Reduced transformer complexity for simple operations

#### Repository-Domain Integration

**Decision**: Repository methods call domain entity methods for business logic.

**Implementation**:

```typescript
async updateActiveStatus(id: number, active: boolean): Promise<SubScenarioEntity> {
  // 1. Get current entity
  const currentEntity = await this.getById(id);

  // 2. Use domain method (business logic)
  currentEntity.updateActiveStatus(active);

  // 3. Persist minimal change
  const result = await this.httpClient.put(`/sub-scenarios/${id}`, {
    active: currentEntity.active
  });

  return SubScenarioTransformer.toDomain(result.data);
}
```

### 3. Use Case Intelligent Routing

#### Operation Complexity Detection

**Decision**: Use Cases detect operation complexity and route to appropriate handlers.

**Rationale**:

- Simple operations (like status toggle) don't need full entity construction
- Complex operations require full validation and entity building
- Performance optimization for common simple operations

**Implementation**:

```typescript
export class UpdateSubScenarioUseCase {
  async execute(
    id: number,
    command: UpdateSubScenarioCommand,
  ): Promise<SubScenarioEntity> {
    // Detect simple operations
    const commandKeys = Object.keys(command);
    const isSimpleStatusToggle =
      commandKeys.length === 1 && commandKeys[0] === "active";

    if (isSimpleStatusToggle) {
      // Route to specialized repository method
      return await this.subScenarioRepository.updateActiveStatus(
        id,
        command.active!,
      );
    }

    // Handle complex operations with full entity construction
    const entityData = this.buildEntityData(command);
    const entity = SubScenarioTransformer.toDomain(entityData, {
      forUpdate: true,
    });
    return await this.subScenarioRepository.update(id, entity);
  }
}
```

### 4. Transformer Context-Aware Behavior

#### Contextual Entity Processing

**Decision**: Transformers behave differently based on operation context.

**Rationale**:

- Update operations should remove IDs (DDD compliance)
- Display operations should preserve IDs for UI functionality
- Single transformer handles both scenarios

**Implementation**:

```typescript
function toDomain(
  backendData: SubScenarioBackend,
  options?: { forUpdate?: boolean },
): SubScenarioEntity {
  let processedData = backendData;

  // Remove ID for update operations (DDD compliance)
  if (options?.forUpdate === true) {
    const { id, ...dataWithoutId } = backendData;
    processedData = dataWithoutId;
  }

  return SubScenarioEntity.fromApiData(processedData);
}
```

## Architectural Benefits

### Performance Optimizations

1. **Simple Operations**: Status toggles bypass complex entity construction
2. **Minimal Data Transfer**: Only changed fields sent to backend
3. **Reduced Validation**: Simple operations have lighter validation paths

### Maintainability Improvements

1. **Single Responsibility**: Each layer has clear responsibilities
2. **Business Logic Encapsulation**: Domain methods keep logic in domain layer
3. **Flexible Routing**: Use Cases can handle different operation complexities

### DDD Compliance

1. **Domain-Centric Design**: Business logic lives in domain entities
2. **ID-less Entities**: Entities can exist without persistence concerns
3. **Invariant Enforcement**: Domain methods validate business rules

## Implementation Guidelines

### When to Add Domain Methods

1. **State Modifications**: Any change that requires business validation
2. **Complex Calculations**: Business logic that spans multiple properties
3. **Invariant Enforcement**: Operations that must maintain business rules

### When to Add Specialized Repository Methods

1. **High-Frequency Operations**: Common operations like status toggles
2. **Performance-Critical Paths**: Operations where minimal data transfer matters
3. **Domain-Specific Logic**: Operations that benefit from domain method usage

### When to Use Intelligent Routing in Use Cases

1. **Mixed Complexity Operations**: When same endpoint handles simple and complex operations
2. **Performance Requirements**: When simple operations need optimization
3. **Clear Operation Detection**: When operation type can be reliably detected

## Future Considerations

### Scalability

- Pattern can be extended to other entities (Scenario, User, etc.)
- Repository specialization can include caching strategies
- Domain methods can include event publishing for complex workflows

### Testing Strategy

- Domain methods can be unit tested independently
- Repository methods can be tested with mocked HTTP clients
- Use Case routing can be tested with different command structures

### Monitoring

- Specialized methods can include specific metrics
- Performance comparison between simple and complex operation paths
- Business logic execution tracking through domain methods
