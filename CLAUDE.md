# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` (runs Next.js dev server)
- **Build**: `pnpm build` (creates production build)
- **Start production**: `pnpm start` (serves production build)
- **Lint**: `pnpm lint` (runs Next.js ESLint)
- **Sort imports**: `pnpm run sort-imports-manual` (custom import sorting script)
- **Install dependencies**: `pnpm install`

## Tech Stack & Architecture

### Core Technologies

- **Framework**: Next.js 15 with App Router
- **React**: v19 with React Server Components
- **TypeScript**: Full TypeScript setup with strict mode
- **Styling**: Tailwind CSS v4 with CSS custom properties theming
- **UI Components**: Radix UI primitives + shadcn/ui component system
- **State Management**: React Query v5 for server state, React Context for client state
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom auth system using httpOnly cookies

### Architecture Pattern: Domain-Driven Design (DDD)

The codebase follows a **feature-based DDD architecture** with clear separation of concerns:

#### Core Directory Structure:

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (public)/          # Public routes (auth, reservations, scenarios)
│   ├── api/               # API routes and server endpoints
│   └── dashboard/         # Protected admin dashboard routes
├── application/           # Application layer (use cases, commands, orchestrators)
├── entities/              # Domain entities and business logic
├── infrastructure/        # External services, repositories, and DI configuration
├── presentation/          # Presentation layer (UI components and features)
│   ├── components/        # Shared presentation components
│   └── features/          # Feature-specific UI modules
├── shared/                # Shared utilities, components, and infrastructure
└── mock-data/            # Mock data for development and testing
```

#### Feature Module Pattern:

Each feature in `src/presentation/features/` follows this structure:

```
presentation/features/[feature-name]/
├── api/                 # Server actions and API queries
├── components/          # UI components (atoms, molecules, organisms, pages)
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Simple component combinations
│   ├── organisms/      # Complex UI sections
│   └── pages/          # Full page layouts
├── hooks/              # Custom React hooks
├── services/           # API services and external integrations
├── types/              # TypeScript type definitions
├── utils/              # Feature-specific utilities
├── di/                 # Dependency injection containers (server-side)
├── domain/             # Business logic and repository interfaces
├── infrastructure/     # External service adapters
├── application/        # Use cases and application logic
└── use-cases/         # Organized use case implementations
```

#### Key Architectural Concepts:

1. **Clean Architecture Layers**:

   - **Application Layer** (`src/application/`): Use cases, commands, orchestrators, and DTOs
   - **Domain Layer** (`src/entities/`): Domain entities and business logic
   - **Infrastructure Layer** (`src/infrastructure/`): External services, repositories, and DI configuration
   - **Presentation Layer** (`src/presentation/`): UI components and feature-specific logic

2. **Repository Pattern**: Each entity has repository adapters in `entities/[entity]/infrastructure/`
3. **Pragmatic Architecture**: Command Pattern only used where justified (complex operations), direct Server Action calls for CRUD
4. **Dependency Injection**: Lightweight custom DI implementation (~100 lines) in `infrastructure/config/di/` using SimpleContainer
5. **Server Actions**: Business logic exposed via Next.js server actions in `infrastructure/web/controllers/`
6. **Use Cases**: Application logic in `application/[domain]/use-cases/` with clear business validation
7. **Separation of Client/Server**: Clear distinction between client and server code

### Architecture Layers Detailed

#### Application Layer (`src/application/`)

Contains business logic orchestration and application-specific use cases:

- **Use Cases**: Business logic implementations (`[domain]/use-cases/`)
- **Utils**: Domain-specific utilities and builders (`[domain]/utils/`)
- **Actions**: Legacy export actions (`[domain]/actions/`)

**Note**: Commands pattern removed from scenarios for simplicity. Use Cases called directly from Server Actions.

#### Domain Layer (`src/entities/`)

Core business entities and domain logic:

- **Domain Models**: Core business entities (`[entity]/domain/`)
- **Repository Interfaces**: Contracts for data access (`[entity]/infrastructure/`)
- **Domain Services**: Domain-specific business logic
- **API Queries**: React Query configurations (`[entity]/api/`)

#### Infrastructure Layer (`src/infrastructure/`)

External concerns and technical implementations:

- **Repositories**: Data access implementations (`repositories/`) - unwrap BackendResponse to clean domain entities
- **DI Configuration**: Simple DI setup (`config/di/`) with string-based tokens and lightweight container
- **Web Controllers**: Server Actions (`web/controllers/`) with ErrorHandlerComposer for consistent error handling
- **External Services**: HTTP clients and third-party integrations

#### Presentation Layer (`src/presentation/`)

User interface and user experience concerns:

- **Features**: Self-contained feature modules (`features/[feature]/`)
- **Shared Components**: Reusable UI components (`components/`)
- **Feature Architecture**: Each feature contains its own components, hooks, services, and UI logic

### Authentication Architecture

- **Session Management**: httpOnly cookies with server-side validation
- **Auth Context**: `src/presentation/features/auth/model/use-auth.tsx` provides client-side auth state
- **Server Auth**: `src/shared/api/server-auth.ts` handles server-side authentication
- **Auth Guards**: Component-level protection via `src/presentation/features/auth/ui/auth-guard.tsx`
- **Role-Based Access**: Permission system in `src/shared/interfaces/permission.interface.ts`

### Dependency Injection Architecture

The project uses a **lightweight custom DI system** for consistent dependency management:

#### Simple DI Container (`src/infrastructure/config/di/`)

- **SimpleContainer**: Custom DI implementation (~100 lines) with singleton/transient lifecycle support
- **TOKENS**: String-based dependency tokens instead of Symbol-based tokens
- **ContainerFactory**: Environment-aware factory for creating DI containers
- **Lifecycle Management**: Supports both singleton (repositories) and transient (use cases) patterns

#### Usage Pattern:

```typescript
// In server actions or pages
const container = ContainerFactory.createContainer();
const useCase = container.get<UseCaseType>(TOKENS.UseCaseToken);
```

#### Benefits:

- **Consistent Architecture**: Same DI pattern across all features
- **Lightweight**: ~100 lines vs 50kb external library
- **Type Safe**: Full TypeScript support with generic types
- **Environment Aware**: Different configurations for dev/test/prod
- **Simple Tokens**: String-based tokens for better debugging

### HTTP Client Architecture

The project uses a **dual HTTP client pattern**:

- **Client-side**: `src/shared/api/http-client-client.ts` for browser requests
- **Server-side**: `src/shared/api/http-client-server.ts` for SSR/API routes
- **Legacy**: `src/shared/api/index.ts` contains deprecated API client (being migrated)

### Component Organization

Components are organized using **Atomic Design principles**:

- **atoms/**: Basic UI elements (buttons, inputs)
- **molecules/**: Simple component combinations
- **organisms/**: Complex UI sections
- **pages/**: Full page layouts
- **templates/**: Page-level layouts

UI components are located in:

- `src/shared/ui/`: Base UI primitives (shadcn/ui components)
- `src/shared/components/`: Shared business components
- `src/presentation/components/`: Shared presentation components
- `src/presentation/features/[feature]/components/`: Feature-specific components

### State Management Strategy

- **Server State**: React Query with query keys in `entities/[entity]/api/`
- **Client State**: React Context for authentication and global UI state
- **Form State**: React Hook Form with Zod schemas in `presentation/features/[feature]/schemas/`
- **URL State**: Next.js searchParams for filters and pagination

### Path Aliases

TypeScript paths are configured for clean imports:

- `@/*` → `./src/*`
- `@/presentation/features/*` → `./src/presentation/features/*`
- `@/shared/*` → `./src/shared/*`
- `@/entities/*` → `./src/entities/*`
- `@/application/*` → `./src/application/*`
- `@/infrastructure/*` → `./src/infrastructure/*`

### Code Quality & Git Hooks

- **Pre-commit**: Husky runs lint-staged with custom import sorting
- **Import Sorting**: Custom script sorts imports by length (longest first)
- **Linting**: ESLint with Next.js configuration
- **Formatting**: Prettier with import sorting plugin

### Key Business Domains

1. **Reservations**: Booking system with flexible scheduling
2. **Scenarios**: Facility/location management
3. **Sub-scenarios**: Nested facility sections
4. **Authentication**: User management with role-based access
5. **Dashboard**: Admin interface for data management

### Development Notes

- The codebase follows a **Pragmatic Clean Architecture** pattern avoiding over-engineering
- **Domain-Driven Design (DDD)** principles guide the overall structure
- Server Components are used extensively for initial data loading
- Authentication uses httpOnly cookies to prevent XSS attacks
- All forms use React Hook Form with Zod validation for type safety
- The UI system is based on Radix UI primitives with custom theming
- **Hybrid Approach**: Command Pattern for complex operations (reservations), direct calls for CRUD (scenarios)
- **Repository Pattern** ensures clean data access abstractions with BackendResponse unwrapping
- **Simple DI System**: Custom ~100-line implementation with string tokens, no external dependencies
- **Error Handling**: Consistent ErrorHandlerResult pattern across all Server Actions
- **Modal Management**: Fixed UI flicker issues with proper callback ordering
- Mock data is available in `src/mock-data/` for development and testing

### Implementation Patterns

#### CRUD Operations (Scenarios Pattern):

```typescript
UI Component → Server Action → Use Case → Repository → HTTP Client → Backend
```

#### Complex Operations (Reservations Pattern):

```typescript
UI Component → Command → Server Action → Multiple Use Cases → Repositories → HTTP Client → Backend
```
