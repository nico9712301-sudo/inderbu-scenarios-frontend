# Architecture Guide - Inderbu Scenarios Frontend

## 📐 Clean Architecture Principles

Este proyecto sigue **Clean Architecture** con separación estricta de responsabilidades y dependencias que apuntan hacia el dominio.

## 📁 Folder Structure

```
src/
├── app/                        ← Next.js App Router (Route Handlers)
│   └── dashboard/
│       ├── scenarios/
│       │   └── page.tsx                      ← Server Component Entry Point
│       └── sub-scenarios/
│           └── page.tsx                      ← Server Component Entry Point
│
├── entities/                   ← Solo dominio PURO (Business Rules)
│   ├── scenario/
│   │   └── domain/
│   │       ├── IScenarioRepository.ts          ← Repository Interface
│   │       └── scenario.domain.ts              ← Domain Entity
│   ├── neighborhood/
│   │   └── domain/
│   │       ├── INeighborhoodRepository.ts
│   │       └── neighborhood.domain.ts
│   ├── activity-area/
│   │   └── domain/
│   │       ├── IActivityAreaRepository.ts
│   │       └── activity-area.domain.ts
│   └── sub-scenario/
│       └── domain/
│           ├── ISubScenarioRepository.ts
│           └── sub-scenario.domain.ts
│
├── application/                ← Application Layer (Use Cases + Commands + Queries)
│   ├── scenario/
│   │   ├── commands/                           ← Write Operations
│   │   │   ├── CreateScenarioCommand.ts
│   │   │   ├── UpdateScenarioCommand.ts
│   │   │   └── DeleteScenarioCommand.ts
│   │   ├── queries/                            ← Read Operations
│   │   │   ├── GetScenariosQuery.ts
│   │   │   ├── GetScenarioByIdQuery.ts
│   │   │   └── SearchScenariosQuery.ts
│   │   └── use-cases/                          ← Business Logic Orchestration
│   │       ├── CreateScenarioUseCase.ts
│   │       ├── UpdateScenarioUseCase.ts
│   │       ├── GetScenariosUseCase.ts
│   │       ├── GetScenarioByIdUseCase.ts
│   │       └── DeleteScenarioUseCase.ts
│   ├── neighborhood/
│   │   ├── commands/
│   │   ├── queries/
│   │   └── use-cases/
│   ├── activity-area/
│   │   ├── commands/
│   │   ├── queries/
│   │   └── use-cases/
│   └── sub-scenario/
│       ├── commands/
│       ├── queries/
│       └── use-cases/
│
├── infrastructure/             ← Infrastructure Layer (External Concerns)
│   ├── repositories/                           ← Data Access Implementations
│   │   ├── scenario-repository.adapter.ts     ← Implements IScenarioRepository
│   │   ├── neighborhood-repository.adapter.ts
│   │   ├── activity-area-repository.adapter.ts
│   │   └── sub-scenario-repository.adapter.ts
│   ├── api/                                    ← External API Communication
│   │   ├── http-client.ts                     ← HTTP Transport Layer (PURE)
│   │   ├── auth.ts                            ← Authentication Context
│   │   └── types.ts                           ← API Response Types
│   ├── web/                                   ← Web Framework Infrastructure
│   │   ├── controllers/                       ← Server Actions (Next.js Controllers)
│   │   │   ├── scenario.actions.ts            ← Error Handling Boundary
│   │   │   ├── neighborhood.actions.ts
│   │   │   ├── activity-area.actions.ts
│   │   │   └── sub-scenario.actions.ts
│   │   └── middleware/                        ← Request/Response Processing
│   └── config/
│       └── di/                               ← Custom Lightweight DI
│           ├── simple-container.ts           ← ~100 line DI implementation
│           ├── tokens.ts                     ← Simple string tokens
│           ├── container.factory.ts          ← Environment detection & creation
│           └── modules/                      ← Feature configuration functions
│               ├── repositories.module.ts   ← All repository bindings
│               ├── scenarios.module.ts      ← Scenario use cases config
│               ├── auth.module.ts           ← Auth use cases config
│               ├── reservations.module.ts   ← Reservation use cases config
│               └── testing.module.ts        ← Mock configurations
│
├── presentation/               ← Presentation Layer (UI Only)
│   └── components/                           ← React Components
│       ├── dashboard/
│       │   ├── scenarios/                    ← Scenario-specific UI
│       │   │   ├── pages/                    ← Page-level components
│       │   │   │   └── scenarios.page.tsx
│       │   │   └── components/
│       │   │       ├── organisms/            ← Complex UI blocks
│       │   │       │   ├── create-scenario-modal.component.tsx
│       │   │       │   └── scenarios-table.component.tsx
│       │   │       ├── molecules/            ← Composite UI elements
│       │   │       │   └── scenario-form.component.tsx
│       │   │       └── atoms/                ← Basic UI elements
│       │   │           └── scenario-status-badge.component.tsx
│       │   └── sub-scenarios/
│       │       └── components/
│       └── shared/                           ← Reusable UI Components
│           ├── organisms/
│           ├── molecules/
│           └── atoms/
│
└── shared/                     ← Cross-cutting Concerns
    ├── hooks/                                ← Reusable React Hooks
    ├── ui/                                   ← Base UI Component Library
    ├── utils/                                ← Framework-agnostic Utilities
    │   └── error-handler.ts                  ← Error Handling (Template Method)
    └── types/                                ← Shared TypeScript Types
```

## 🎯 Dependency Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Application   │    │     Domain      │
│ (UI Components) │───▶│ (Use Cases +    │───▶│   (Entities +   │
│                 │    │  Commands +     │    │  Repositories   │
│                 │    │  Queries)       │    │  Interfaces)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐              │                       │
│ Infrastructure  │──────────────┴───────────────────────┘
│ (Repositories + │
│  HTTP + Web     │
│  Controllers)   │
└─────────────────┘
```

## Layer Responsibilities

### 🎪 **Domain Layer** (`entities/`)

- **Domain Entities** - Core business objects (Scenario, Neighborhood, etc.)
- **Repository Interfaces** - Contracts for data access (IScenarioRepository)
- **Value Objects** - Immutable objects representing business concepts
- **Domain Services** - Complex business logic that doesn't belong to a single entity
- **NO Dependencies** - Pure business rules, framework-agnostic

### 🎯 **Application Layer** (`application/`)

- **Use Cases** - Individual business operations (CreateScenarioUseCase, GetScenariosUseCase)
- **Application Services** - Cross-domain orchestration (GetScenariosDataService, GetSubScenariosDataService)
  - Coordinate multiple Use Cases from different domains
  - Compose complex data responses for UI requirements
  - Handle cross-cutting concerns like filtering and pagination
- **Repository Pattern** - Standardized data access with HttpClient injection
- **NO Framework Dependencies** - Pure business logic orchestration

### 🎨 **Presentation Layer** (`presentation/` + `app/`)

- **App Router Pages** (`app/`) - Next.js Server Components (page.tsx files)
- **React Components** (`presentation/components/`) - UI Components organized by Atomic Design
- **React Hooks** - UI state management and side effects
- **Event Handlers** - User interactions and form submissions
- **NO Business Logic** - Only UI concerns and user interactions

### **Infrastructure Layer** (`infrastructure/`)

**🎯 Key Principle**: The Infrastructure layer is the **ONLY** layer that knows about external concerns and framework-specific implementations. It implements domain contracts and provides the DI Container.

#### **Repositories** (`infrastructure/repositories/`)

- **Implementaciones de interfaces** - Cumple contratos del dominio
- **Data mapping** - Convierte API responses a entidades
- **External API calls** - Comunicación con backend

#### **API** (`infrastructure/api/`)

- **HTTP Client** - Transport layer puro
- **Authentication** - Auth context y tokens
- **API Types** - Tipos específicos de API

#### **Web Controllers** (`infrastructure/web/controllers/`)

- **Server Actions** - Next.js server functions (scenario.actions.ts)
- **Request/Response handling** - Input validation and transformation
- **Error Boundary** - Single point of error handling with ErrorHandlerComposer
- **Framework Integration** - Next.js specific logic (revalidatePath, etc.)

#### **Dependency Injection** (`infrastructure/config/di/`)

**Custom Lightweight DI Container** - Homegrown solution optimized for our needs:

- **Simple Container** (simple-container.ts) - Lightweight DI implementation (~100 lines vs 50kb Inversify)
- **Types & Tokens** (tokens.ts) - Dependency identifiers for type-safe injection
- **Modules** (modules/) - Domain-specific binding modules (Repository, UseCase modules)
- **Container Factory** (container.factory.ts) - Environment-aware container creation
- **Lifecycle Management** - Singleton vs Transient scope support
- **Testing Support** - Easy mocking and dependency override for tests
- **Consistent API** - Same interface patterns across all features for predictable development

### **Shared Layer** (`shared/`)

- **UI Components** - Reutilizables entre features
- **Utilities** - Helpers sin dependencias de negocio
- **Types** - Tipos compartidos
- **Hooks** - React hooks genéricos

## 🚀 Data Flow Example - Scenarios Feature (Pragmatic Clean Architecture)

### 📝 **Create Scenario Flow (5 Layers - Optimal):**

```
1. Server Component (app/dashboard/scenarios/page.tsx)
   ↓ uses Simple DI Container → GetScenariosDataUseCase for SSR data
   ↓ renders
2. Client Component (presentation/features/dashboard/scenarios/pages/scenarios.page.tsx)
   ↓ user clicks "Create" → opens
3. Modal Component (presentation/features/dashboard/scenarios/organisms/create-scenario-modal.component.tsx)
   ↓ directly calls (NO Command pattern - eliminated over-engineering)
4. Server Action (infrastructure/web/controllers/dashboard/scenario.actions.ts)
   createScenarioAction() with ErrorHandlerComposer → returns ErrorHandlerResult<Scenario>
   ↓ uses Simple DI Container to get
5. Use Case (application/dashboard/scenarios/use-cases/CreateScenarioUseCase.ts)
   Resolved from container.get<CreateScenarioUseCase>(TOKENS.CreateScenarioUseCase)
   ↓ calls domain interface
6. Repository Interface (entities/scenario/infrastructure/IScenarioRepository.ts)
   ↓ implemented by
7. Repository Adapter (infrastructure/repositories/scenario-repository.adapter.ts)
   Resolved from container.get<IScenarioRepository>(TOKENS.IScenarioRepository)
   ↓ unwraps BackendResponse<Scenario> → returns clean Scenario
   ↓ uses HTTP client
8. HTTP Client (shared/api/http-client-client.ts) - Pure transport layer
   ↓ calls
9. Backend API (/scenarios POST) → returns { data: Scenario, message: string, statusCode: number }
```

**Key Optimizations Applied:**

- ❌ **Removed**: Command Factory, Command Handlers, Command Orchestrators (8 layers → 5 layers)
- ✅ **Kept**: Use Cases (business logic), Repository pattern (data abstraction), DI (loose coupling)
- ✅ **Added**: BackendResponse unwrapping to prevent double data nesting
- ✅ **Fixed**: Modal flicker by correct callback ordering

### 🔍 **Get Scenarios Flow (Server-Side Rendering with DI Container):**

```
1. Server Component (app/dashboard/scenarios/page.tsx)
   ↓ uses DI Container via ContainerFactory.createContainer()
2. Use Case (application/dashboard/scenarios/use-cases/GetScenariosDataUseCase.ts)
   Resolved from container.get<GetScenariosDataUseCase>(TOKENS.GetScenariosDataUseCase)
   ↓ calls multiple repositories
3. Repository (infrastructure/repositories/scenario-repository.adapter.ts)
   Resolved from container.get<IScenarioRepository>(TOKENS.IScenarioRepository)
   ↓ calls
4. HTTP Client (shared/api/http-client-client.ts)
   ↓ GET /scenarios?filters
5. Returns data to Client Component (presentation/features/dashboard/scenarios/pages/scenarios.page.tsx)
   Pre-rendered with SSR data
```

### ⚙️ **Update Scenario Flow (Direct Server Action Call):**

```
1. UI Modal (presentation/features/dashboard/scenarios/organisms/edit-scenario-modal.component.tsx)
   ↓ directly calls
2. Server Action (infrastructure/web/controllers/scenario.actions.ts)
   updateScenarioAction() with ErrorHandlerComposer
   ↓ uses DI Container to get
3. Use Case (application/dashboard/scenarios/use-cases/UpdateScenarioUseCase.ts)
   Resolved from container.get<UpdateScenarioUseCase>(TOKENS.UpdateScenarioUseCase)
   ↓ calls
4. Repository (infrastructure/repositories/scenario-repository.adapter.ts)
   Resolved from container.get<IScenarioRepository>(TOKENS.IScenarioRepository)
   ↓ PUT /scenarios/:id
5. Returns updated Scenario entity
```

### **Toggle Scenario Status Flow:**

```
1. UI Page (presentation/features/dashboard/scenarios/pages/scenarios.page.tsx)
   ↓ user clicks toggle → calls handleToggleStatus()
   ↓ directly calls
2. Server Action (infrastructure/web/controllers/scenario.actions.ts)
   updateScenarioAction(scenarioId, { active: !currentState })
   ↓ follows same path as Update Scenario Flow
3. Returns success/error feedback to UI with toast notification
```

## 🎯 **Arquitectura Híbrida: Simplicidad vs Complejidad**

### **Scenarios: Arquitectura Simplificada (CRUD Simple)**

**Decisión Arquitectónica:** Eliminamos el Command Pattern para operaciones CRUD simples.

#### **Capas Eliminadas:**

- ❌ Command Factory (ScenarioCommandFactory)
- ❌ Command Handlers (CreateScenarioCommandHandler, UpdateScenarioCommandHandler)
- ❌ Command Interfaces (ICreateScenarioCommand, IUpdateScenarioCommand)
- ❌ Command Orchestrators
- ❌ DTOs específicos de Commands

#### **Flujo Actual (5 capas):**

```
UI Component → Server Action → Use Case → Repository → HTTP Client
```

#### **Ventajas de la Simplificación:**

- **37% menos código** (de 8 capas a 5)
- **Más fácil de entender** y mantener
- **Menos archivos** que mantener
- **Performance mejorado** (menos overhead)
- **Debugging más directo**
- **Onboarding más rápido** para nuevos desarrolladores

#### **Cuándo usar Command Pattern:**

- 💡 **Operaciones complejas** (transacciones multi-step)
- 💡 **Workflows** con múltiples pasos
- 💡 **Undo/Redo** functionality
- 💡 **Event sourcing**
- 💡 **Sagas** o coordinación compleja

**Ejemplo donde SÍ usar Commands:** Reservaciones (validación de slots, pricing dinámico, múltiples entidades)

## 🔧 **Simple DI Container Implementation**

### **Usage Pattern:**

```typescript
// In Server Actions or Server Components
const container = ContainerFactory.createContainer();
const useCase = container.get<CreateScenarioUseCase>(
  TOKENS.CreateScenarioUseCase,
);
const result = await useCase.execute(data);
```

### **Container Configuration:**

```typescript
// infrastructure/config/di/container.factory.ts
export class ContainerFactory {
  static createContainer(): SimpleContainer {
    const container = new SimpleContainer();

    // Repository bindings (Singleton)
    container
      .bind<IScenarioRepository>(TOKENS.IScenarioRepository)
      .toSingleton(() => new ScenarioRepository());

    // Use Case bindings (Transient)
    container
      .bind<CreateScenarioUseCase>(TOKENS.CreateScenarioUseCase)
      .toTransient(
        () =>
          new CreateScenarioUseCase(
            container.get<IScenarioRepository>(TOKENS.IScenarioRepository),
          ),
      );

    return container;
  }
}
```

### **Benefits of Simple DI:**

- ✅ **Lightweight**: ~100 lines vs 50kb external library (Inversify)
- ✅ **Type Safe**: Full TypeScript support with generics
- ✅ **No Decorators**: No `@injectable` or `@inject` decorators needed
- ✅ **String Tokens**: Easy debugging with `TOKENS.CreateScenarioUseCase`
- ✅ **Lifecycle Control**: Singleton for repositories, Transient for use cases
- ✅ **Environment Aware**: Different configurations for dev/test/prod

## 🏗️ **Implementation Guidelines for New Features**

### **For CRUD Operations (Like Scenarios):**

```typescript
1. Create Use Case in application/[feature]/use-cases/
2. Create Server Action in infrastructure/web/controllers/
3. Call Server Action directly from UI (no Commands)
4. Return ErrorHandlerResult<T> for consistent error handling
5. Use Simple DI for dependency injection
```

### **For Complex Operations (Like Reservations):**

```typescript
1. Consider Command Pattern if multi-step or complex coordination
2. Use Use Cases for business logic orchestration
3. Repository pattern for data access
4. Event-driven architecture if needed
```

## Architecture Rules

### ** Allowed Dependencies:**

- Infrastructure → Domain (implements interfaces)
- Application → Domain (uses entities)
- Presentation → Application (calls use cases)
- Infrastructure/Web → Application (server actions call use cases)

### **Forbidden Dependencies:**

- Domain → Any other layer
- Application → Infrastructure
- Application → Presentation
- Shared → Features (shared should be generic)

## 🛠️ Key Patterns Used

### **1. Repository Pattern**

```typescript
// Domain Interface (entities/scenario/domain/IScenarioRepository.ts)
export interface IScenarioRepository {
  create(data: CreateScenarioData): Promise<Scenario>;
  findWithPagination(filters: ScenarioFilters): Promise<PaginatedScenarios>;
  update(id: number, data: UpdateScenarioData): Promise<Scenario>;
}

// Infrastructure Implementation (infrastructure/repositories/scenario-repository.adapter.ts)
export class ScenarioRepository implements IScenarioRepository {
  async create(data: CreateScenarioData): Promise<Scenario> {
    const httpClient = ClientHttpClientFactory.createClient(authContext);
    return await httpClient.post<Scenario>("/scenarios", data);
  }
}
```

### **2. Command/Query Pattern (CQRS)**

```typescript
// Command (application/scenario/commands/CreateScenarioCommand.ts)
export interface CreateScenarioCommand {
  name: string;
  address: string;
  description?: string;
  neighborhoodId: number;
}

// Query (application/scenario/queries/GetScenariosQuery.ts)
export interface GetScenariosQuery {
  page?: number;
  limit?: number;
  search?: string;
  neighborhoodId?: number;
  active?: boolean;
}
```

### **3. Use Case Pattern**

```typescript
// Use Case (application/scenario/use-cases/CreateScenarioUseCase.ts)
export class CreateScenarioUseCase {
  constructor(private readonly scenarioRepository: IScenarioRepository) {}

  async execute(command: CreateScenarioCommand): Promise<Scenario> {
    // Business validation
    if (!command.name.trim()) {
      throw new Error("Scenario name is required");
    }

    return await this.scenarioRepository.create(command);
  }
}
```

### **4. Custom Dependency Injection**

```typescript
// Simple Container (infrastructure/config/di/simple-container.ts)
export class SimpleContainer {
  private dependencies = new Map<string, () => any>();
  private instances = new Map<string, any>();

  bind<T>(token: string): Binding<T> {
    return new Binding<T>(token, this.dependencies, this.instances);
  }

  get<T>(token: string): T {
    const factory = this.dependencies.get(token);
    if (!factory) throw new Error(`Dependency ${token} not registered`);
    return factory();
  }
}

class Binding<T> {
  constructor(
    private token: string,
    private dependencies: Map<string, () => any>,
    private instances: Map<string, any>,
  ) {}

  to(factory: () => T): Binding<T> {
    this.dependencies.set(this.token, factory);
    return this;
  }

  singleton(): void {
    const originalFactory = this.dependencies.get(this.token)!;
    this.dependencies.set(this.token, () => {
      if (!this.instances.has(this.token)) {
        this.instances.set(this.token, originalFactory());
      }
      return this.instances.get(this.token);
    });
  }
}

// Tokens (infrastructure/config/di/tokens.ts)
export const TOKENS = {
  // Repositories
  IScenarioRepository: "IScenarioRepository",
  INeighborhoodRepository: "INeighborhoodRepository",

  // Use Cases
  CreateScenarioUseCase: "CreateScenarioUseCase",
  UpdateScenarioUseCase: "UpdateScenarioUseCase",
  GetScenariosUseCase: "GetScenariosUseCase",
} as const;

// Module (infrastructure/config/di/modules/scenarios.module.ts)
export function configureScenarios(container: SimpleContainer) {
  container
    .bind<CreateScenarioUseCase>(TOKENS.CreateScenarioUseCase)
    .to(
      () =>
        new CreateScenarioUseCase(
          container.get<IScenarioRepository>(TOKENS.IScenarioRepository),
        ),
    );

  container
    .bind<UpdateScenarioUseCase>(TOKENS.UpdateScenarioUseCase)
    .to(
      () =>
        new UpdateScenarioUseCase(
          container.get<IScenarioRepository>(TOKENS.IScenarioRepository),
        ),
    );

  container
    .bind<GetScenariosDataUseCase>(TOKENS.GetScenariosDataUseCase)
    .to(
      () =>
        new GetScenariosDataUseCase(
          container.get<GetScenariosUseCase>(TOKENS.GetScenariosUseCase),
          container.get<GetNeighborhoodsUseCase>(
            TOKENS.GetNeighborhoodsUseCase,
          ),
        ),
    );
}

// Factory (infrastructure/config/di/container.factory.ts)
export class ContainerFactory {
  static createContainer(): SimpleContainer {
    const container = new SimpleContainer();
    const environment = process.env.NODE_ENV || "development";

    // Configure repositories (singleton)
    configureRepositories(container);

    // Configure use cases (transient)
    configureScenarios(container);
    configureAuth(container);
    configureReservations(container);
    configureSubScenarios(container);

    // Environment-specific overrides
    if (environment === "test") {
      configureMocks(container);
    }

    return container;
  }
}
```

### **5. Clean Use Cases (No Decorators)**

```typescript
// Use Case (application/scenario/use-cases/CreateScenarioUseCase.ts)
export class CreateScenarioUseCase {
  constructor(private readonly scenarioRepository: IScenarioRepository) {}

  async execute(command: CreateScenarioCommand): Promise<Scenario> {
    // Business validation
    if (!command.name.trim()) {
      throw new Error("Scenario name is required");
    }

    return await this.scenarioRepository.create(command);
  }
}

// Repository (infrastructure/repositories/scenario-repository.adapter.ts)
export class ScenarioRepository implements IScenarioRepository {
  constructor(private httpClient: HttpClient) {}

  async create(data: CreateScenarioData): Promise<Scenario> {
    return await this.httpClient.post<Scenario>("/scenarios", data);
  }
}

// DI Module Registration
export function configureScenariosDI(container: SimpleContainer) {
  // Repositories (singleton)
  container
    .bind<IScenarioRepository>(TOKENS.IScenarioRepository)
    .to(() => new ScenarioRepository(createHttpClient()))
    .singleton();

  // Use Cases (transient)
  container
    .bind<CreateScenarioUseCase>(TOKENS.CreateScenarioUseCase)
    .to(
      () =>
        new CreateScenarioUseCase(
          container.get<IScenarioRepository>(TOKENS.IScenarioRepository),
        ),
    );
}
```

### **6. Environment-Specific Configuration**

```typescript
// Testing Configuration (infrastructure/config/di/modules/testing.module.ts)
export function configureMocks(container: SimpleContainer) {
  // Override repositories with mocks
  container
    .bind<IScenarioRepository>(TOKENS.IScenarioRepository)
    .to(() => createMockScenarioRepository())
    .singleton();

  container
    .bind<INeighborhoodRepository>(TOKENS.INeighborhoodRepository)
    .to(() => createMockNeighborhoodRepository())
    .singleton();
}

// Development Configuration
export function configureDevelopment(container: SimpleContainer) {
  // Add debug logging
  container
    .bind<ILogger>(TOKENS.Logger)
    .to(() => new ConsoleLogger())
    .singleton();

  // Add performance monitoring
  container
    .bind<IMonitor>(TOKENS.Monitor)
    .to(() => new DevelopmentMonitor())
    .singleton();
}

// Container Factory with Environment Detection
export class ContainerFactory {
  static createContainer(): SimpleContainer {
    const container = new SimpleContainer();
    const environment = process.env.NODE_ENV || "development";

    // Base configuration
    configureRepositories(container);
    configureUseCases(container);

    // Environment-specific overrides
    switch (environment) {
      case "test":
        configureMocks(container);
        break;
      case "development":
        configureDevelopment(container);
        break;
      case "production":
        configureProduction(container);
        break;
    }

    return container;
  }
}
```

### **7. Error Handling (Single Point)**

```typescript
// Server Action (infrastructure/web/controllers/scenario.actions.ts)
import { ContainerFactory } from "@/infrastructure/config/di/container.factory";
import { TOKENS } from "@/infrastructure/config/di/tokens";

export async function createScenarioAction(data: CreateScenarioCommand) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container = ContainerFactory.createContainer();
    const createScenarioUseCase = container.get<CreateScenarioUseCase>(
      TOKENS.CreateScenarioUseCase,
    );

    const created = await createScenarioUseCase.execute(data);

    revalidatePath("/dashboard/scenarios"); // Next.js cache invalidation
    return created;
  }, "createScenarioAction");
}
```

### **8. Atomic Design in UI**

```typescript
// Organism (presentation/components/dashboard/scenarios/organisms/create-scenario-modal.component.tsx)
export function CreateScenarioModal({ isOpen, onClose, onScenarioCreated }) {
  const handleSubmit = async (formData) => {
    const result = await createScenarioAction(formData); // Calls Server Action

    if (result.success) {
      toast.success("Scenario created successfully"); // UI Feedback
      onScenarioCreated(result.data);
    } else {
      toast.error(result.error); // Error Feedback
    }
  };

  return (
    <ScenarioForm onSubmit={handleSubmit} /> {/* Molecule Component */}
  );
}
```

## Application Services Pattern - NEW ARCHITECTURE

### **Application Services vs Use Cases**

**Use Cases** (`/src/application/dashboard/[domain]/use-cases/`):

- Single-domain business operations
- Examples: `CreateScenarioUseCase`, `GetScenariosUseCase`, `GetActivityAreasUseCase`
- Called directly for CRUD operations

**Application Services** (`/src/application/dashboard/[domain]/services/`):

- Cross-domain orchestration and composition
- Examples: `GetScenariosDataService`, `GetSubScenariosDataService`
- Coordinate multiple Use Cases for complex UI requirements

### **Implementation Examples**

#### **GetScenariosDataService (Simple Composition)**

```typescript
export class GetScenariosDataService {
  constructor(
    private readonly getScenariosUseCase: GetScenariosUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase,
  ) {}

  async execute(filters: ScenarioFilters): Promise<IScenariosDataResponse> {
    const [scenariosResult, neighborhoods] = await Promise.all([
      this.getScenariosUseCase.execute(filters),
      this.getNeighborhoodsUseCase.execute(),
    ]);

    return {
      scenarios: scenariosResult.data,
      neighborhoods,
      meta: scenariosResult.meta,
      filters,
    };
  }
}
```

#### **GetSubScenariosDataService (Complex Composition)**

```typescript
export class GetSubScenariosDataService {
  constructor(
    private readonly getScenariosUseCase: GetScenariosUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase,
    private readonly getActivityAreasUseCase: GetActivityAreasUseCase,
    private readonly getFieldSurfaceTypesUseCase: GetFieldSurfaceTypesUseCase,
    private readonly getSubScenariosUseCase: GetSubScenariosUseCase,
  ) {}

  async execute(
    filters: SubScenariosFilters,
  ): Promise<ISubScenariosDataResponse> {
    // Orchestrate 5 different Use Cases in parallel
    const [
      scenarios,
      neighborhoods,
      activityAreas,
      fieldSurfaceTypes,
      subScenarios,
    ] = await Promise.all([
      this.getScenariosUseCase.execute({ limit: 100 }),
      this.getNeighborhoodsUseCase.execute(),
      this.getActivityAreasUseCase.execute(),
      this.getFieldSurfaceTypesUseCase.execute(),
      this.getSubScenariosUseCase.execute(filters),
    ]);

    return {
      subScenarios: subScenarios.data,
      scenarios: scenarios.data,
      activityAreas,
      neighborhoods,
      fieldSurfaceTypes,
      meta: subScenarios.meta,
      filters,
    };
  }
}
```

### **DI Container Configuration**

```typescript
// Application Services (transient)
container
  .bind<GetScenariosDataService>(TOKENS.GetScenariosDataService)
  .to(
    () =>
      new GetScenariosDataService(
        container.get<GetScenariosUseCase>(TOKENS.GetScenariosUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase),
      ),
  );

container
  .bind<GetSubScenariosDataService>(TOKENS.GetSubScenariosDataService)
  .to(
    () =>
      new GetSubScenariosDataService(
        container.get<GetScenariosUseCase>(TOKENS.GetScenariosUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase),
        container.get<GetActivityAreasUseCase>(TOKENS.GetActivityAreasUseCase),
        container.get<GetFieldSurfaceTypesUseCase>(
          TOKENS.GetFieldSurfaceTypesUseCase,
        ),
        container.get<GetSubScenariosUseCase>(TOKENS.GetSubScenariosUseCase),
      ),
  );
```

### **Repository Standardization - HttpClient Injection**

All repositories now follow a consistent pattern:

```typescript
export class ScenarioRepository implements IScenarioRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async create(data: CreateScenarioData): Promise<Scenario> {
    const result = await this.httpClient.post<BackendResponse<Scenario>>(
      "/scenarios",
      data,
    );
    return result.data; // Unwrap backend response
  }
}

export class ActivityAreaRepository implements IActivityAreaRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<ActivityArea[]> {
    return await this.httpClient.get<ActivityArea[]>("/activity-areas");
  }
}

export class FieldSurfaceTypeRepository implements IFieldSurfaceTypeRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<FieldSurfaceType[]> {
    return await this.httpClient.get<FieldSurfaceType[]>(
      "/field-surface-types",
    );
  }
}
```

### **Key Architectural Benefits**

1. **Separation of Concerns**: Use Cases handle single operations, Services handle orchestration
2. **Reusability**: Use Cases can be reused across different Services
3. **Testability**: Each layer can be tested independently
4. **Consistency**: Standardized HttpClient injection across all repositories
5. **Performance**: Parallel execution in Application Services
6. **Maintainability**: Clear boundaries between simple and complex operations

## 🎯 Benefits of This Architecture

1. **Testability** - Each layer can be tested in isolation with easy mocking
2. **Maintainability** - Clear separation of concerns and dependency boundaries
3. **Flexibility** - Easy to change implementations without affecting other layers
4. **Scalability** - Modular architecture supports easy feature additions
5. **Type Safety** - Full TypeScript support with compile-time dependency checking
6. **Environment Flexibility** - Different configurations for dev/test/production
7. **Performance** - Proper lifecycle management (singleton repositories, transient use cases)
8. **Testing Support** - Built-in mocking and test doubles for all dependencies
9. **Consistency** - Same DI pattern across ALL features for predictable development
10. **Lightweight** - Custom DI solution (~100 lines) vs heavy frameworks (50kb+)
11. **Control** - Full ownership of DI implementation, customizable to our needs
12. **Developer Experience** - Consistent APIs and patterns reduce cognitive load

## 🚨 Common Anti-patterns to Avoid

### **Domain depending on Infrastructure**

```typescript
// BAD - Domain importing from infrastructure
import { HttpClient } from "../../infrastructure/api/http-client";
```

### **Use Cases with UI Logic**

```typescript
// BAD - Use case with UI concerns
export class CreateScenarioUseCase {
  async execute() {
    const result = await this.repository.create();
    toast.success("Created!"); // UI Logic in Use Case
    return result;
  }
}
```

### **Inconsistent Dependency Patterns**

```typescript
// BAD - Mixed patterns across features
// Scenarios using DI
const container = createContainer();
const useCase = container.get<CreateScenarioUseCase>(
  TOKENS.CreateScenarioUseCase,
);

// Auth using factory
const authUseCase = AuthFactory.createLoginUseCase();

// Reservations using direct instantiation
const reservationUseCase = new CreateReservationUseCase(repo);

// GOOD - Consistent DI pattern everywhere
const container = createContainer();
const scenarioUseCase = container.get(TOKENS.CreateScenarioUseCase);
const authUseCase = container.get(TOKENS.LoginUseCase);
const reservationUseCase = container.get(TOKENS.CreateReservationUseCase);
```

### **God Containers**

```typescript
// BAD - One container for everything
export interface MegaContainer {
  // Scenarios
  createScenarioUseCase: CreateScenarioUseCase;
  // Neighborhoods
  getNeighborhoodsUseCase: GetNeighborhoodsUseCase;
  // Activity Areas
  getActivityAreasUseCase: GetActivityAreasUseCase;
  // ... 50+ more dependencies
}
```

### **No Environment Separation**

```typescript
// BAD - Same container for all environments
// Production uses same dependencies as tests!
export function createContainer() {
  return new UniversalContainer(); // No env-specific config
}
```

### **Features importing from other Features**

```typescript
// BAD - Cross-feature dependencies
import { ScenarioComponent } from "../scenarios/components/";
```

## 🚀 Implementation Status - COMPLETED

### **Phase 1: Custom DI Infrastructure - COMPLETED**

- **Simple Container** implemented in `infrastructure/config/di/simple-container.ts`
- **Tokens & identifiers** created in `infrastructure/config/di/tokens.ts`
- **Base interfaces** and binding mechanisms implemented
- **Lifecycle management** (singleton/transient) support added
- **Module system** for feature-specific DI configuration

### **Phase 2: Clean Architecture Migration - COMPLETED**

- **Removed decorators** (@injectable, @inject) from Use Cases and Repositories
- **Domain-specific modules** created with configuration functions
- **Container factory** implemented with environment detection
- **Server actions** updated to use custom DI container
- **Clean constructor injection** without framework dependencies

### **Phase 3: Environment-Specific Configuration - COMPLETED**

- **Development configuration** with debug tools and enhanced logging
- **Testing configuration** with mocks and test doubles
- **Production configuration** with optimized dependencies
- **Lifecycle management** implemented (singleton repos, transient use cases)
- **Container health checks** and diagnostic utilities

### **Phase 4: Consistency & Optimization - COMPLETED**

- **Uniform DI pattern** applied across ALL features (scenarios, auth, reservations)
- **Server-Client separation** ensuring DI only on server-side
- **Complete testing infrastructure** with mock utilities and examples
- **Lightweight solution** (~100 lines vs 50kb external dependency)
- **Production-ready architecture** with enterprise patterns but optimal performance

## 🗺️ Complete Architecture Map

```
┌─────────────────────────────────────────────────────────┐
│              🌎 CLIENT SIDE (Browser)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🖥️ CreateScenarioModal.tsx (Client Component)          │
│     │                                                  │
│     │ calls                                           │
│     ↓                                                  │
│  ⚡ ScenarioCommandFactory.createScenario()             │
│     │                                                  │
│     │ creates CreateScenarioCommandImpl              │
│     ↓                                                  │
│  💫 Command.execute() → calls Server Action           │
│                                                         │
└─────────────────────────────────────────────────────────┘
                              │
                              │ "use server" boundary
                              ↓
┌─────────────────────────────────────────────────────────┐
│              🛡️ SERVER SIDE (Next.js)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🌐 createScenarioAction() - Server Action              │
│     │                                                  │
│     │ creates DI Container                           │
│     ↓                                                  │
│   ContainerFactory.createContainer()                │
│     │                                                  │
│     │ resolves dependencies with Inversify          │
│     ↓                                                  │
│  🎯 CreateScenarioUseCase (@injectable)               │
│     │                                                  │
│     │ injected with @inject(TYPES.IScenarioRepository)│
│     ↓                                                  │
│  💾 ScenarioRepository (@injectable)                  │
│     │                                                  │
│     │ calls HTTP Client                              │
│     ↓                                                  │
│  🌐 HTTP Client → Backend API                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **🎯 Current Architecture Status**

**FULLY IMPLEMENTED:**

- **Custom Lightweight DI** - Homegrown solution optimized for our needs (~100 lines)
- **Consistent Patterns** - Same DI approach across ALL features (scenarios, auth, reservations, etc.)
- **Environment-specific configuration** (Dev/Test/Production) without external dependencies
- **Complete testing infrastructure** with easy mocking and dependency overrides
- **Type-safe dependency resolution** with full TypeScript support
- **Performance optimized** - No external DI framework overhead
- **Clean Architecture** compliance with proper layer separation

**🔑 Key Success Factors:**

1. **Architectural Consistency**: Same DI pattern everywhere - predictable for all developers
2. **Server-Client Separation**: DI Container **NEVER** imported in client components
3. **Developer Experience**: "Everything uses container.get()" - single learning curve
4. **Performance**: Lightweight custom solution vs heavy external dependencies
5. **Control**: Full ownership of DI implementation, customizable to our exact needs
6. **Clean Architecture**: Proper dependency flow from outer to inner layers
7. **Testing**: Built-in mock support without external framework complexities

**🎆 This architecture achieves enterprise-grade patterns with optimal performance and developer experience!**

### **💡 Architecture Philosophy**

> **"Consistency over Perfection"** - Better to have a uniform medium-complex solution across all features than inconsistent simple-to-complex patterns that confuse developers and hurt maintainability.

Our custom DI solution provides:

- **Predictable patterns** across all features
- **Easy onboarding** - "Everything uses container.get()"
- **Performance optimization** - No external dependencies
- **Full control** - Customizable to our exact requirements

## **Domain Entity Transformation & Serialization Pattern**

### **Overview**

El patrón de transformación y serialización maneja la conversión bidireccional entre datos del backend y entidades de dominio, respetando la separación de responsabilidades de Clean Architecture.

### **Architecture Responsibilities**

#### **📦 Infrastructure Layer - Domain Transformers**

```typescript
// Infrastructure: Generic transformer pattern
export interface IDomainTransformer<TBackend, TDomain> {
  toDomain(backendData: TBackend): TDomain;
  toDomain(backendData: TBackend[]): TDomain[];
  toBackend(domainEntity: TDomain): TBackend;
  toBackend(domainEntities: TDomain[]): TBackend[];
}

// Infrastructure: ActivityArea specific transformer
export const ActivityAreaTransformer: IDomainTransformer<
  ActivityArea,
  ActivityAreaEntity
> = createDomainTransformer(
  (data) => ActivityAreaEntity.fromApiData(data), // Backend → Domain
  (entity) => entity.toApiFormat(), // Domain → Backend
  isValidActivityAreaBackend, // Validation
  isValidActivityAreaDomain,
);
```

#### **🏗️ Repository Layer - Uses Transformers**

```typescript
// Repository uses transformer for bidirectional conversion
export class ActivityAreaRepositoryAdapter implements IActivityAreaRepository {
  async getAll(): Promise<ActivityAreaEntity[]> {
    // 1. Get backend response
    const result =
      await this.httpClient.get<BackendPaginatedResponse<ActivityArea>>(
        "/activity-areas",
      );

    // 2. Transform backend data to domain entities
    return ActivityAreaTransformer.toDomain(result.data);
  }

  async create(
    data: Omit<ActivityAreaEntity, "id">,
  ): Promise<ActivityAreaEntity> {
    // 1. Transform domain entity to backend format
    const backendData = ActivityAreaTransformer.toBackend(
      data as ActivityAreaEntity,
    );

    // 2. Call backend
    const result = await this.httpClient.post<
      BackendPaginatedResponse<ActivityArea>
    >("/activity-areas", backendData);

    // 3. Transform response back to domain entity
    return ActivityAreaTransformer.toDomain(result.data[0]);
  }
}
```

#### **🎯 Application Layer - Pure Domain Entities**

```typescript
// Application Service returns pure domain entities (no serialization concerns)
export class GetSubScenariosDataService {
  async execute(
    filters: SubScenariosFilters,
  ): Promise<ISubScenariosDataResponse> {
    const activityAreas = await this.getActivityAreasUseCase.execute();

    return {
      activityAreas, // ActivityAreaEntity[] - Pure domain entities
      scenarios,
      neighborhoods,
      // ... other data
    };
  }
}
```

#### **🖥️ Presentation Layer - Serialization for Client Components**

```typescript
// Server Component: Handles serialization for Next.js Client Components
export default async function SubScenariosRoute(props: SubScenariosRouteProps) {

  // 1. Execute Application Service - returns pure Domain Entities
  const domainResult: ISubScenariosDataResponse = await getSubScenariosDataService.execute(filters);

  // 2. Presentation Layer responsibility: Serialize for client components
  const serializedResult = serializeSubScenariosData(domainResult);

  // 3. Pass serialized data (plain objects) to client component
  return <SubScenariosPage initialData={serializedResult} />;
}

// Serialization utility (Presentation Layer)
export function serializeSubScenariosData(
  domainResponse: ISubScenariosDataResponse
): ISubScenariosDataClientResponse {
  return {
    activityAreas: domainResponse.activityAreas.map(entity => entity.toPlainObject()),
    scenarios: domainResponse.scenarios,
    // ... other data
  };
}
```

### **Complete Flow Example - ActivityArea**

#### **1. Read Operation (Backend → Domain → UI)**

```
1. Repository calls backend → BackendPaginatedResponse<ActivityArea>
2. Repository transforms → ActivityAreaEntity[] (using transformer)
3. Use Case applies business rules → Active ActivityAreaEntity[]
4. Application Service orchestrates → Pure domain response
5. Server Component serializes → Plain objects for client
6. Client Component receives → Serialized data (no classes)
```

#### **2. Write Operation (UI → Domain → Backend)**

```
1. Client Component → Form data
2. Server Action → Validates and calls Use Case
3. Use Case → Business logic with ActivityAreaEntity
4. Repository transforms → ActivityArea (using transformer)
5. Repository calls backend → HTTP request with backend format
6. Backend response transforms back → ActivityAreaEntity
```

### **✅ Benefits of This Pattern**

**🏛️ Architectural Benefits:**

- **Clean Separation**: Each layer has single responsibility
- **Domain Purity**: Application layer never knows about serialization
- **Framework Independence**: Application layer works for web, mobile, desktop
- **Testability**: Easy to mock transformers and test each layer independently

**🔧 Technical Benefits:**

- **Type Safety**: Full TypeScript support with overloaded methods
- **Bidirectional**: Handles both read and write operations
- **Reusable**: Generic transformer pattern works for any entity
- **Validation**: Centralized data validation in transformers
- **Next.js Compatible**: Solves Server/Client Component serialization

**🚀 Developer Benefits:**

- **Consistent API**: Same pattern across all entities
- **Composable**: Repository uses transformer via composition
- **Scalable**: Easy to add new entities with same pattern
- **Debuggable**: Clear transformation points for troubleshooting

### **🎯 Key Implementation Rules**

1. **Domain Entities** - Never know about serialization or Next.js constraints
2. **Application Services** - Always return pure domain entities
3. **Repositories** - Use transformers for bidirectional conversion
4. **Server Components** - Handle serialization for client components
5. **Transformers** - Single responsibility for data conversion
6. **Client Components** - Receive plain objects, never domain entities

**This pattern maintains Clean Architecture principles while solving real-world framework constraints!**

## 📄 **DDD Pagination Wrapper Pattern**

### **Theoretical Foundation**

The pagination wrapper pattern follows **Clean Architecture** and **Domain-Driven Design** principles based on industry standards:

- ✅ **Uncle Bob's Clean Architecture**: Uses DTOs (wrapper objects) to cross architectural boundaries without polluting domain
- ✅ **Martin Fowler's DTO Pattern**: Batches data transfer between layers to reduce method calls
- ✅ **Microsoft eShopOnContainers**: Industry-standard wrapper pattern for commands/queries
- ✅ **DDD Best Practices**: Separates pure domain entities from technical metadata

### **Complete Implementation Pattern**

#### **🏗️ Repository Layer - Returns Pagination Wrapper**

```typescript
// All repositories follow the same consistent pattern
export interface PaginatedEntities {
  data: EntityEntity[]; // Pure domain entities (business concern)
  meta: PageMeta; // Technical metadata (infrastructure concern)
}

export class ScenarioRepository implements IScenarioRepository {
  async getAll(filters?: ScenarioFilters): Promise<PaginatedScenarios> {
    const result =
      await this.httpClient.get<BackendPaginatedResponse<ScenarioBackend>>();
    const transformedData = ScenarioTransformer.toDomain(result.data);

    return {
      data: transformedData, // Domain entities
      meta: result.meta, // Pagination metadata
    };
  }
}
```

#### **🎯 Use Case Layer - Returns Pagination Wrapper**

```typescript
// Use Cases maintain business logic while preserving pagination
export class GetScenariosUseCase {
  async execute(filters?: ScenarioFilters): Promise<PaginatedScenarios> {
    // Business validation can be applied here
    return await this.scenarioRepository.getAll(filters);
  }
}

export class GetActivityAreasUseCase {
  async execute(
    filters?: ActivityAreaFilters,
  ): Promise<PaginatedActivityAreas> {
    return await this.activityAreaRepository.getAll(filters);
  }
}

export class GetNeighborhoodsUseCase {
  async execute(
    filters?: NeighborhoodFilters,
  ): Promise<PaginatedNeighborhoods> {
    return await this.neighborhoodRepository.getAll(filters);
  }
}

export class GetFieldSurfaceTypesUseCase {
  async execute(
    filters?: FieldSurfaceTypeFilters,
  ): Promise<PaginatedFieldSurfaceTypes> {
    return await this.fieldSurfaceTypeRepository.getAll(filters);
  }
}

export class GetSubScenariosUseCase {
  async execute(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    return await this.subScenarioRepository.getAll(filters);
  }
}
```

#### **🎨 Application Service Layer - Extracts Domain Entities**

```typescript
// Application Services extract .data for business composition
export class GetSubScenariosDataService {
  async execute(
    filters: SubScenariosFilters,
  ): Promise<ISubScenariosDataResponse> {
    // All use cases return consistent pagination wrappers
    const [
      scenariosResult,
      activityAreasResult,
      neighborhoodsResult,
      fieldSurfaceTypesResult,
      subScenariosResult,
    ] = await Promise.all([
      this.getScenariosUseCase.execute({ limit: 100 }), // PaginatedScenarios
      this.getActivityAreasUseCase.execute(), // PaginatedActivityAreas
      this.getNeighborhoodsUseCase.execute(), // PaginatedNeighborhoods
      this.getFieldSurfaceTypesUseCase.execute(), // PaginatedFieldSurfaceTypes
      this.getSubScenariosUseCase.execute(filters), // PaginatedSubScenarios
    ]);

    // Extract pure domain entities for business logic
    return {
      subScenarios: subScenariosResult.data, // SubScenarioEntity[]
      scenarios: scenariosResult.data, // ScenarioEntity[]
      activityAreas: activityAreasResult.data, // ActivityAreaEntity[]
      neighborhoods: neighborhoodsResult.data, // NeighborhoodEntity[]
      fieldSurfaceTypes: fieldSurfaceTypesResult.data, // FieldSurfaceTypeEntity[]
      meta: subScenariosResult.meta, // PageMeta for main entity
      filters, // Current filters
    };
  }
}
```

#### **🖥️ Presentation Layer - Serialization for Client Components**

```typescript
// Server Component handles serialization for Next.js constraints
export default async function SubScenariosRoute(props: SubScenariosRouteProps) {

  // 1. Get domain entities from Application Service
  const domainResult = await getSubScenariosDataService.execute(filters);

  // 2. Serialize for client components (Presentation layer responsibility)
  const serializedResult = serializeSubScenariosData(domainResult);

  // 3. Pass plain objects to client component
  return <SubScenariosPage initialData={serializedResult} />;
}

// Presentation utilities handle domain entity → plain object conversion
export function serializeSubScenariosData(
  domainResponse: ISubScenariosDataResponse
): ISubScenariosDataClientResponse {
  return {
    subScenarios: serializeSubScenarios(domainResponse.subScenarios),
    scenarios: serializeScenarios(domainResponse.scenarios),
    activityAreas: serializeActivityAreas(domainResponse.activityAreas),
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods),
    fieldSurfaceTypes: serializeFieldSurfaceTypes(domainResponse.fieldSurfaceTypes),
    meta: domainResponse.meta,
    filters: domainResponse.filters,
  };
}
```

### **🎯 Consistent Entity Implementation**

**All entities follow the same pattern:**

1. **Scenarios** → `PaginatedScenarios`
2. **ActivityAreas** → `PaginatedActivityAreas`
3. **Neighborhoods** → `PaginatedNeighborhoods`
4. **FieldSurfaceTypes** → `PaginatedFieldSurfaceTypes`
5. **SubScenarios** → `PaginatedSubScenarios`

### **📊 Complete Data Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Backend      │───▶│   Repository    │───▶│   Use Case      │
│ (Paginated API) │    │ (PaginatedWrap) │    │ (PaginatedWrap) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Client Component│◄───│Server Component │◄───│Application Svc  │
│ (Plain Objects) │    │ (Serialization) │    │ (Pure Entities) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **✅ Architecture Benefits**

**🏛️ DDD Compliance:**

- **Domain Purity**: Entities remain focused on business logic
- **Technical Separation**: Pagination metadata handled separately
- **Boundary Crossing**: Proper DTOs for layer communication
- **Framework Independence**: Application layer agnostic to Next.js

**🔧 Technical Benefits:**

- **Type Safety**: Full TypeScript support with generic interfaces
- **Consistency**: Same pattern across all entities
- **Reusability**: Use cases composable in multiple services
- **Performance**: Parallel execution with Promise.all

**🚀 Developer Benefits:**

- **Predictable**: Same pattern for every entity
- **Maintainable**: Clear separation of concerns
- **Testable**: Each layer independently mockable
- **Scalable**: Easy to add new entities following same pattern

### **🎯 Key Implementation Rules**

1. **Repository Layer**: Always return `PaginatedEntities` wrapper
2. **Use Case Layer**: Maintain wrapper, apply business validation
3. **Application Service Layer**: Extract `.data` for business composition
4. **Presentation Layer**: Handle serialization for client components
5. **Domain Entities**: Never know about pagination metadata
6. **Client Components**: Receive plain objects, never domain entities

**This pagination pattern achieves DDD compliance while maintaining practical usability and Next.js compatibility!**
