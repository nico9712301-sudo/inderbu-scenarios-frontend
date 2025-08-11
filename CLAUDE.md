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
│   └── dashboard/         # Protected admin dashboard routes
├── entities/              # Domain entities (business logic)
├── features/              # Feature modules (UI + business logic)
├── shared/               # Shared utilities, components, and infrastructure
└── config/               # Application configuration
```

#### Feature Module Pattern:

Each feature in `src/features/` follows this structure:

```
features/[feature-name]/
├── components/           # UI components (atoms, molecules, organisms)
├── hooks/               # Custom React hooks
├── services/            # API services and external integrations
├── types/               # TypeScript type definitions
├── utils/               # Feature-specific utilities
├── api/                 # Server actions and API queries
├── di/                  # Dependency injection containers
├── domain/              # Business logic and repositories
├── infrastructure/      # External service adapters
└── use-cases/          # Application use cases
```

#### Key Architectural Concepts:

1. **Repository Pattern**: Each entity has repository adapters in `entities/[entity]/infrastructure/`
2. **Dependency Injection**: Use DI containers in `features/[feature]/di/` for server-side composition
3. **Server Actions**: Business logic exposed via Next.js server actions in `features/[feature]/api/`
4. **Use Cases**: Application logic in `features/[feature]/use-cases/` following Clean Architecture
5. **Separation of Client/Server**: Clear distinction between client and server code

### Authentication Architecture

- **Session Management**: httpOnly cookies with server-side validation
- **Auth Context**: `src/features/auth/model/use-auth.tsx` provides client-side auth state
- **Server Auth**: `src/shared/api/server-auth.ts` handles server-side authentication
- **Auth Guards**: Component-level protection via `src/features/auth/ui/auth-guard.tsx`
- **Role-Based Access**: Permission system in `src/shared/interfaces/permission.interface.ts`

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
- `src/features/[feature]/components/`: Feature-specific components

### State Management Strategy

- **Server State**: React Query with query keys in `entities/[entity]/api/`
- **Client State**: React Context for authentication and global UI state
- **Form State**: React Hook Form with Zod schemas in `features/[feature]/schemas/`
- **URL State**: Next.js searchParams for filters and pagination

### Path Aliases

TypeScript paths are configured for clean imports:

- `@/*` → `./src/*`
- `@/presentation/features/*` → `./src/features/*`
- `@/shared/*` → `./src/shared/*`
- `@/config/*` → `./src/config/*`

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

- The codebase is actively migrating from legacy API patterns to the new DDD architecture
- Server Components are used extensively for initial data loading
- Authentication uses httpOnly cookies to prevent XSS attacks
- All forms use React Hook Form with Zod validation for type safety
- The UI system is based on Radix UI primitives with custom theming
