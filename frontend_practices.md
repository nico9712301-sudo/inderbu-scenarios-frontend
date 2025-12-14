# Prácticas y Arquitectura del Frontend - Inderbu Scenarios

Este documento describe las prácticas, arquitecturas, patrones, componentes y convenciones utilizadas en el proyecto, basado en el análisis del 60% de las páginas implementadas.

---

## 📐 Arquitectura General

### Clean Architecture con DDD (Domain-Driven Design)

El proyecto sigue **Clean Architecture** con separación estricta de capas y principios de **Domain-Driven Design**:

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

### Estructura de Directorios

```
src/
├── app/                        # Next.js App Router (Route Handlers)
│   ├── (public)/              # Rutas públicas
│   ├── api/                   # API Routes
│   └── dashboard/              # Rutas del dashboard
│
├── entities/                   # Capa de Dominio (Business Rules)
│   ├── [entity]/
│   │   ├── domain/           # Entidades de dominio
│   │   ├── infrastructure/   # Interfaces de repositorios
│   │   ├── api/              # Query keys y queries de React Query
│   │   └── model/             # Tipos y DTOs
│
├── application/                # Capa de Aplicación (Use Cases)
│   ├── [domain]/
│   │   ├── use-cases/        # Casos de uso
│   │   ├── services/         # Servicios de orquestación
│   │   └── actions/          # Acciones de exportación
│
├── infrastructure/            # Capa de Infraestructura
│   ├── repositories/         # Implementaciones de repositorios
│   ├── transformers/         # Transformadores Backend ↔ Domain
│   ├── web/                  # Server Actions (Next.js Controllers)
│   └── config/               # Configuración DI
│       └── di/              # Dependency Injection
│
├── presentation/              # Capa de Presentación
│   ├── features/             # Features organizadas por dominio
│   │   ├── [feature]/
│   │   │   ├── components/  # Componentes UI (Atomic Design)
│   │   │   │   ├── atoms/
│   │   │   │   ├── molecules/
│   │   │   │   ├── organisms/
│   │   │   │   └── pages/
│   │   │   ├── hooks/       # Custom hooks
│   │   │   └── types/        # Tipos específicos
│
└── shared/                    # Recursos Compartidos
    ├── api/                  # HTTP Clients, tipos API
    ├── components/           # Componentes compartidos
    ├── ui/                   # Componentes shadcn/ui
    ├── hooks/                # Hooks compartidos
    └── utils/                # Utilidades
```

---

## 🏗️ Patrones Arquitectónicos

### 1. Repository Pattern

**Ubicación**: `entities/[entity]/infrastructure/I[Entity]Repository.ts`

**Patrón**: Interfaces en el dominio, implementaciones en infraestructura.

```typescript
// Domain Interface
export interface ISubScenarioRepository {
  getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios>;
  getById(id: number): Promise<SubScenarioEntity>;
  create(data: Omit<SubScenarioEntity, "id">): Promise<SubScenarioEntity>;
  update(
    id: number,
    data: Partial<SubScenarioEntity>,
  ): Promise<SubScenarioEntity>;

  // Métodos especializados para operaciones simples
  updateActiveStatus(id: number, active: boolean): Promise<SubScenarioEntity>;
}

// Infrastructure Implementation
export class SubScenarioRepository implements ISubScenarioRepository {
  constructor(private httpClient: ClientHttpClient) {}

  async getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    // Implementación con HTTP client
  }
}
```

**Características**:

- Interfaces en el dominio (sin dependencias)
- Implementaciones en infraestructura
- Métodos especializados para operaciones simples (optimización)
- Transformadores para convertir Backend ↔ Domain

### 2. Use Case Pattern

**Ubicación**: `application/[domain]/use-cases/[UseCase].ts`

**Patrón**: Casos de uso que orquestan la lógica de negocio.

```typescript
export class UpdateSubScenarioUseCase {
  constructor(private subScenarioRepository: ISubScenarioRepository) {}

  async execute(
    id: number,
    command: UpdateSubScenarioCommand,
  ): Promise<SubScenarioEntity> {
    // Detección inteligente de complejidad
    const isSimpleStatusToggle =
      Object.keys(command).length === 1 && Object.keys(command)[0] === "active";

    if (isSimpleStatusToggle) {
      // Ruta optimizada para operaciones simples
      return await this.subScenarioRepository.updateActiveStatus(
        id,
        command.active!,
      );
    }

    // Ruta completa para operaciones complejas
    const entity = SubScenarioTransformer.toDomain(entityData);
    return await this.subScenarioRepository.update(id, entity);
  }
}
```

**Características**:

- Routing inteligente según complejidad de operación
- Operaciones simples → métodos especializados del repositorio
- Operaciones complejas → construcción completa de entidad
- Integración con métodos de dominio para lógica de negocio

### 3. Server Actions Pattern

**Ubicación**: `infrastructure/web/controllers/dashboard/[entity].actions.ts`

**Patrón**: Next.js Server Actions como controladores.

```typescript
"use server";

import { ErrorHandlerComposer } from "@/shared/api/error-handler";
import { ContainerFactory } from "@/infrastructure/config/di/container.factory";

export async function updateUserAction(id: number, data: UpdateUserDto) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Validación de entrada
    if (!id || id <= 0) {
      throw new Error("Valid user ID is required");
    }

    // Obtener dependencias del contenedor DI
    const container = ContainerFactory.createContainer();
    const updateUserUseCase = container.get<UpdateUserUseCase>(
      TOKENS.UpdateUserUseCase,
    );

    // Ejecutar caso de uso
    const result = await updateUserUseCase.execute(id, data);

    // Invalidar caché de Next.js
    revalidatePath("/dashboard/clients");

    return result;
  }, "updateUserAction");
}
```

**Características**:

- `"use server"` directive para Server Actions
- Manejo de errores consistente con `ErrorHandlerComposer`
- Dependency Injection para casos de uso
- Invalidación de caché con `revalidatePath`
- Validación de entrada antes de ejecutar casos de uso

### 4. Dependency Injection (DI)

**Ubicación**: `infrastructure/config/di/`

**Patrón**: Contenedor DI ligero personalizado (~100 líneas).

```typescript
// Container Factory
export class ContainerFactory {
  static createContainer(): IContainer {
    const container = new SimpleContainer();

    // Registrar repositorios
    registerRepositories(container);

    // Registrar casos de uso
    registerScenariosUseCases(container);
    registerUsersUseCases(container);
    // ...

    return container;
  }
}

// Uso en Server Actions
const container = ContainerFactory.createContainer();
const useCase = container.get<UseCaseType>(TOKENS.UseCaseToken);
```

**Características**:

- Implementación ligera (~100 líneas vs 50kb de librerías externas)
- Type-safe con TypeScript
- Tokens string-based para mejor debugging
- Singleton para repositorios, Transient para casos de uso
- Configuración por módulos (repositories, use-cases, etc.)

---

## 🌐 HTTP Client Architecture

### Dual HTTP Client Pattern

El proyecto utiliza **dos implementaciones separadas** de HTTP Client:

#### 1. Client HTTP Client (Browser)

**Ubicación**: `src/shared/api/http-client-client.ts`

```typescript
export class ClientHttpClient implements IHttpClient {
  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "") || "http://localhost:3001";
    this.authContext = config.authContext;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.authContext) return {};
    const token = await this.authContext.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("GET", endpoint, { config });
  }
}

// Factory
export class ClientHttpClientFactory {
  static createClientWithAuth(): ClientHttpClient {
    return this.createClient(createClientAuthContext());
  }
}
```

**Características**:

- Usa `fetch` API del navegador
- Autenticación desde cookies (httpOnly)
- Timeout configurable (10s por defecto, 60s para operaciones bulk)
- Manejo especial de errores 401 (post-logout)
- Soporte para FormData

#### 2. Server HTTP Client (SSR)

**Ubicación**: `src/shared/api/http-client-server.ts`

```typescript
export class ServerHttpClient implements HttpClient {
  constructor(config: ServerHttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "");
    this.authContext = config.authContext; // ServerAuthContext
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (this.authContext) {
      const token = await this.authContext.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }
}

// Factory
export class ServerHttpClientFactory {
  static createServerWithAuth(): ServerHttpClient {
    const authContext = createServerAuthContext();
    return this.createServer(authContext);
  }
}
```

**Características**:

- Usa `fetch` de Node.js (SSR)
- Autenticación desde cookies del servidor
- Headers específicos para servidor (`User-Agent: NextJS-Server/1.0`)
- Mismo patrón de manejo de errores que cliente

### Estructura de Endpoints

**Patrón de URLs**:

- Base URL: `process.env.API_URL` (server) o `process.env.NEXT_PUBLIC_API_URL` (client)
- Endpoints RESTful: `/api/[resource]`
- Query params para filtros y paginación
- Arrays en query params: múltiples entradas con misma key

**Ejemplo**:

```typescript
// Construcción de query params
const params = new URLSearchParams();
Object.entries(filters).forEach(([key, val]) => {
  if (val !== undefined && val !== null) {
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, `${v}`));
    } else {
      params.set(key, `${val}`);
    }
  }
});

const endpoint = `/reservations?${params.toString()}`;
```

### Manejo de Errores HTTP

**Patrón**: `ErrorHandlerComposer` con Template Method Pattern

```typescript
export class ErrorHandlerComposer {
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<ErrorHandlerResult<T>> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      // Manejo de ApiError
      if (this.isApiError(error)) {
        return {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        };
      }
      // Manejo de Error genérico
      return {
        success: false,
        error: error.message || `Error inesperado en ${operationName}`,
      };
    }
  }
}
```

**Estructura de ApiError**:

```typescript
export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
```

---

## 🎨 Component Organization (Atomic Design)

### Estructura de Componentes

Los componentes siguen **Atomic Design** organizados por niveles:

```
components/
├── atoms/              # Elementos básicos (Button, Input, Badge)
├── molecules/          # Combinaciones simples (SearchSelect, FilterCard)
├── organisms/          # Secciones complejas (Table, Modal, Header)
└── pages/              # Páginas completas (HomePage, ClientsPage)
```

### Ejemplos por Nivel

#### Atoms

**Ubicación**: `src/presentation/features/[feature]/components/atoms/`

```typescript
// Ejemplo: ExportButton (atoms/export-button.component.tsx)
export function ExportButton({ filters }: ExportButtonProps) {
  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exportar
    </Button>
  );
}
```

**Características**:

- Componentes básicos reutilizables
- Sin lógica de negocio compleja
- Props simples y directas

#### Molecules

**Ubicación**: `src/presentation/features/[feature]/components/molecules/`

```typescript
// Ejemplo: ScenariosFiltersCard (molecules/scenarios-filter-card.component.tsx)
export function ScenariosFiltersCard({
  open,
  filters,
  onFiltersChange,
  onClearFilters,
}: ScenariosFiltersCardProps) {
  return (
    <Collapsible open={open}>
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Inputs de filtros */}
        </CardContent>
      </Card>
    </Collapsible>
  );
}
```

**Características**:

- Combinan múltiples atoms
- Lógica de UI simple
- Props más complejas que atoms

#### Organisms

**Ubicación**: `src/presentation/features/[feature]/components/organisms/`

```typescript
// Ejemplo: ScenariosTable (organisms/scenarios-table.component.tsx)
export function ScenariosTable({
  rows,
  meta,
  loading,
  onEdit,
  onToggleStatus,
  onPageChange,
}: ScenariosTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Escenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          {/* Tabla con datos */}
        </Table>
        <DashboardPagination
          meta={meta}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
```

**Características**:

- Componentes complejos con múltiples responsabilidades
- Integran molecules y atoms
- Pueden tener hooks personalizados

#### Pages

**Ubicación**: `src/presentation/features/[feature]/components/pages/`

```typescript
// Ejemplo: ClientsPage (pages/clients.page.tsx)
export function ClientsPage({ initialData }: ClientsPageProps) {
  const {
    filters,
    users,
    meta,
    onSearch,
    onPageChange,
  } = useClientsData(initialData);

  const {
    isDrawerOpen,
    selectedUser,
    handleOpenDrawer,
    handleCloseDrawer,
  } = useClientModal();

  return (
    <div className="space-y-6">
      <ClientsPageHeader onCreateUser={handleCreateUser} />
      <ClientsTable
        users={users}
        filters={filters}
        onEdit={handleOpenDrawer}
      />
      <UserDrawer
        open={isDrawerOpen}
        user={selectedUser}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
```

**Características**:

- Orquestan organisms y molecules
- Usan hooks personalizados para lógica
- Reciben `initialData` del servidor (SSR)
- Coordinan estado y eventos entre componentes

---

## 🎯 shadcn/ui Integration

### Configuración

**Archivo**: `components.json`

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/components",
    "ui": "@/shared/ui",
    "utils": "@/lib/utils"
  },
  "iconLibrary": "lucide"
}
```

### Componentes shadcn/ui Utilizados

**Ubicación**: `src/shared/ui/`

Componentes principales:

- `button.tsx` - Botones con variantes (default, outline, ghost, etc.)
- `dialog.tsx` - Modales y diálogos
- `table.tsx` - Tablas de datos
- `card.tsx` - Tarjetas contenedoras
- `input.tsx` - Campos de entrada
- `select.tsx` - Selectores desplegables
- `tabs.tsx` - Pestañas
- `badge.tsx` - Badges y etiquetas
- `toast.tsx` / `sonner.tsx` - Notificaciones
- `pagination.tsx` - Paginación
- `dropdown-menu.tsx` - Menús desplegables
- Y más...

### Patrón de Uso

```typescript
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/dialog";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";

// Uso con variantes
<Button variant="outline" size="sm">
  <Plus className="h-4 w-4 mr-2" />
  Nuevo
</Button>

// Uso de Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* Contenido */}
  </DialogContent>
</Dialog>
```

**Características**:

- Componentes basados en Radix UI
- Styling con Tailwind CSS
- Variantes con `class-variance-authority` (cva)
- Type-safe con TypeScript
- Composición flexible con `asChild` prop

---

## 🔄 State Management

### 1. Server State (React Query)

**Ubicación**: `src/shared/api/query-client.ts` y hooks personalizados

```typescript
// Configuración global
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: (failureCount, error: any) => {
          if (error?.statusCode >= 400 && error?.statusCode < 500) {
            return false; // No reintentar errores 4xx
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
```

**Query Keys Pattern**:

```typescript
// entities/reservation/api/reservation-query-keys.ts
export const reservationQueryKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationQueryKeys.all, "list"] as const,
  list: (filters: ReservationsFilters) =>
    [...reservationQueryKeys.lists(), filters] as const,
  details: () => [...reservationQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...reservationQueryKeys.details(), id] as const,
};
```

**Uso en Hooks**:

```typescript
export function useReservationsWidget({ userId, initialData }: Props) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: reservationQueryKeys.list({ userId, ...filters }),
    queryFn: async () => {
      const repository = createRepository();
      return repository.getByUserId(userId, filters);
    },
    initialData: filters.page === 1 ? initialData : undefined,
    staleTime: 5 * 60 * 1000,
  });

  return { data, isLoading, error, refetch };
}
```

**Características**:

- Query keys jerárquicas para invalidación granular
- `initialData` para SSR
- Retry logic inteligente (no reintenta 4xx)
- Optimistic updates cuando es necesario

### 2. Client State (React Hooks)

**Patrón**: Custom hooks para encapsular lógica de estado

```typescript
// Ejemplo: useClientsData
export function useClientsData(initialData: IClientsDataClientResponse) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialData.filters);

  // Sincronización con URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, String(val));
    });
    router.push(`/dashboard/clients?${params.toString()}`);
  }, [filters]);

  return {
    filters,
    users: initialData.users,
    meta: initialData.meta,
    onSearch: (value: string) =>
      setFilters((prev) => ({ ...prev, search: value })),
    onPageChange: (page: number) => setFilters((prev) => ({ ...prev, page })),
  };
}
```

**Características**:

- Hooks personalizados por feature
- Sincronización con URL params
- Estado local para UI (modals, drawers, etc.)

### 3. Form State (React Hook Form + Zod)

**Patrón**: Validación con Zod, estado con React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
});

export function UserForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

---

## 🔀 Transformers Pattern

**Ubicación**: `src/infrastructure/transformers/[Entity]Transformer.ts`

**Patrón**: Transformadores bidireccionales Backend ↔ Domain

```typescript
export const SubScenarioTransformer: IDomainTransformer<
  SubScenarioBackend,
  SubScenarioEntity
> = createDomainTransformer(
  toDomain,
  toBackend,
  isValidSubScenarioBackend,
  isValidSubScenarioDomain,
);

// Backend → Domain
function toDomain(
  backendData: SubScenarioBackend,
  options?: { forUpdate?: boolean },
): SubScenarioEntity {
  let processedData = backendData;

  // Remover ID para actualizaciones (DDD compliance)
  if (options?.forUpdate === true) {
    const { id, ...dataWithoutId } = backendData;
    processedData = dataWithoutId;
  }

  return SubScenarioEntity.fromApiData(processedData);
}

// Domain → Backend
function toBackend(
  domainEntity: SubScenarioEntity | Partial<SubScenarioEntity>,
): SubScenarioBackend | SubScenarioUpdateBackend {
  if (domainEntity instanceof SubScenarioEntity) {
    return domainEntity.toApiFormat();
  }
  return buildPartialBackend(domainEntity);
}
```

**Características**:

- Transformación bidireccional
- Context-aware (diferente comportamiento para updates)
- Validación de tipos
- Manejo de datos parciales

---

## 📄 Page Pattern (SSR + Client)

### Estructura de Páginas

**Patrón**: Server Component → Client Page Component → Hooks

```typescript
// app/dashboard/clients/page.tsx (Server Component)
export default async function ClientsPageServer({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Obtener datos del servidor
  const initialData = await getClientsDataUseCase.execute({
    page: Number(searchParams.page) || 1,
    limit: Number(searchParams.limit) || 10,
    search: searchParams.search as string,
  });

  // Serializar para cliente
  const serializedData = serializeClientsData(initialData);

  return <ClientsPage initialData={serializedData} />;
}
```

```typescript
// presentation/features/dashboard/clients/components/pages/clients.page.tsx (Client Component)
"use client";

export function ClientsPage({ initialData }: ClientsPageProps) {
  const {
    filters,
    users,
    meta,
    onSearch,
    onPageChange,
  } = useClientsData(initialData);

  return (
    <div className="space-y-6">
      <ClientsPageHeader />
      <ClientsTable users={users} filters={filters} />
    </div>
  );
}
```

**Características**:

- Server Components para data fetching
- Client Components para interactividad
- `initialData` serializado desde servidor
- Hooks personalizados para lógica de estado
- Sincronización con URL params

---

## 🎣 Custom Hooks Patterns

### 1. Data Fetching Hooks

```typescript
export function useHomeData({
  initialSubScenarios,
  initialMeta,
  initialFilters = {},
  initialPage = 1,
}: IUseHomeDataParams) {
  const [state, dispatch] = useReducer(homeDataReducer, {
    subScenarios: initialSubScenarios,
    meta: initialMeta,
    filters: initialFilters,
    page: initialPage,
    loading: false,
    error: null,
  });

  const fetchSubScenarios = useCallback(
    async (page: number, filters: IFilters, limit: number) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const result = await repository.getAll({ page, limit, ...filters });
        dispatch({ type: "SET_DATA", payload: result });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: error });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [],
  );

  return {
    subScenarios: state.subScenarios,
    meta: state.meta,
    loading: state.loading,
    error: state.error,
    setPage: (page: number) => dispatch({ type: "SET_PAGE", payload: page }),
    setFilters: (filters: IFilters) =>
      dispatch({ type: "SET_FILTERS", payload: filters }),
  };
}
```

### 2. Modal/Drawer Management Hooks

```typescript
export function useClientModal() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPlainObject | null>(
    null,
  );

  const handleOpenDrawer = useCallback((user: UserPlainObject) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  }, []);

  const handleSaveDrawer = useCallback(
    async (userData: UpdateUserDto) => {
      // Lógica de guardado
      await updateUserAction(selectedUser!.id, userData);
      handleCloseDrawer();
    },
    [selectedUser],
  );

  return {
    isDrawerOpen,
    selectedUser,
    handleOpenDrawer,
    handleCloseDrawer,
    handleSaveDrawer,
  };
}
```

### 3. Debounced Search Hooks

```typescript
export function useDebouncedSearch({
  initialValue = "",
  onSearch,
  delay = 300,
}: UseDebouncedSearchProps) {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, onSearch]);

  return {
    value,
    onChange: (newValue: string) => setValue(newValue),
  };
}
```

---

## 🎨 Styling Practices

### Tailwind CSS

**Configuración**: `tailwind.config.js` (implícito en Tailwind v4)

**Patrones de Clases**:

```typescript
// Clases utilitarias
<div className="space-y-6">
  <Card className="bg-background border-border">
    <CardHeader className="pb-2">
      <CardTitle className="text-2xl font-bold">Título</CardTitle>
    </CardHeader>
  </Card>
</div>

// Variantes con cva
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
  }
);
```

### CSS Variables (Theme)

**Ubicación**: `src/app/globals.css`

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

**Uso**:

```typescript
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Botón
  </Button>
</div>
```

---

## 🔐 Authentication Patterns

### Auth Context

**Ubicación**: `src/presentation/features/auth/model/use-auth.tsx`

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Inicializar autenticación desde cookies
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthReady(true);
      }
    };
    initAuth();
  }, []);

  const logout = async () => {
    await logoutAction();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, authReady, logout };
}
```

### Permission Guards

**Ubicación**: `src/shared/components/molecules/permission-guard.tsx`

```typescript
export function PermissionGuard({
  requiredPermission,
  children,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const hasPermission = checkPermission(user, requiredPermission);

  if (!hasPermission) return null;
  return <>{children}</>;
}
```

---

## 📊 Pagination Patterns

### Dashboard Pagination

**Ubicación**: `src/shared/components/organisms/dashboard-pagination.tsx`

```typescript
export function DashboardPagination({
  meta,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
}: DashboardPaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={!meta.hasPrev}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {meta.page} de {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={!meta.hasNext}
        >
          Siguiente
        </Button>
      </div>
      {showLimitSelector && (
        <Select value={String(meta.limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
```

**Características**:

- Sincronización con URL params
- Selector de límite opcional
- Navegación prev/next
- Meta información (totalItems, totalPages)

---

## 🚨 Error Handling Patterns

### ErrorHandlerComposer

**Ubicación**: `src/shared/api/error-handler.ts`

```typescript
// Uso en Server Actions
export async function updateUserAction(id: number, data: UpdateUserDto) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Operación que puede fallar
    const result = await updateUserUseCase.execute(id, data);
    return result;
  }, "updateUserAction");
}

// Resultado tipado
type ErrorHandlerResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

// Uso en componentes
const result = await updateUserAction(id, data);
if (result.success) {
  toast.success("Usuario actualizado");
} else {
  toast.error(result.error);
}
```

### Toast Notifications

**Patrón**: Sonner para notificaciones

```typescript
import { toast } from "sonner";

// Éxito
toast.success("Usuario actualizado", {
  description: "Los cambios se han guardado correctamente.",
});

// Error
toast.error("Error al actualizar", {
  description: error.message,
});

// Info
toast.info("Información", {
  description: "Proceso completado.",
});
```

---

## 🔄 Data Flow Patterns

### SSR → Client Flow

```
1. Server Component (page.tsx)
   ↓
2. Use Case Execution (getClientsDataUseCase)
   ↓
3. Repository → HTTP Client → Backend API
   ↓
4. Transform Backend → Domain Entity
   ↓
5. Serialize Domain → Plain Object
   ↓
6. Pass to Client Component (initialData)
   ↓
7. Client Component uses Custom Hook
   ↓
8. Hook manages state and interactions
   ↓
9. User actions trigger Server Actions
   ↓
10. Server Actions → Use Cases → Repository → API
```

### Client-Side Updates

```
1. User Action (click, form submit)
   ↓
2. Event Handler calls Server Action
   ↓
3. Server Action → Use Case → Repository
   ↓
4. HTTP Request to Backend
   ↓
5. Success → revalidatePath() → router.refresh()
   ↓
6. Server re-fetches data
   ↓
7. Updated initialData passed to Client Component
   ↓
8. UI updates with new data
```

---

## 📝 TypeScript Patterns

### Type Definitions

**Ubicación**: Por capa y feature

```typescript
// Domain Types
export interface SubScenarioEntity {
  id?: number;
  name: string;
  active: boolean;
  // ...
}

// Backend Types
export interface SubScenarioBackend {
  id?: number;
  name: string;
  active?: boolean;
  // ...
}

// DTOs
export interface CreateSubScenarioDto {
  name: string;
  scenarioId: number;
  // ...
}

// Props Types
export interface ClientsPageProps {
  initialData: IClientsDataClientResponse;
}
```

### Path Aliases

**Configuración**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/entities/*": ["./src/entities/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/presentation/*": ["./src/presentation/*"]
    }
  }
}
```

**Uso**:

```typescript
import { Button } from "@/shared/ui/button";
import { UserEntity } from "@/entities/user/domain/UserEntity";
import { GetUsersUseCase } from "@/application/dashboard/clients/use-cases/GetUsersUseCase";
```

---

## 🧪 Testing Patterns

### Component Testing (Storybook)

**Ubicación**: `src/shared/ui/*.stories.tsx`

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};
```

---

## 📦 Build & Development

### Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "storybook": "storybook dev -p 6006",
    "sort-imports-manual": "node scripts/sort-imports-by-length.js"
  }
}
```

### Lint-Staged

```json
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx}": ["pnpm run sort-imports-manual", "prettier --write"]
  }
}
```

---

## 🎯 Best Practices Summary

### ✅ DO

1. **Separación de capas**: Mantener dominio, aplicación, infraestructura y presentación separadas
2. **Use Cases para lógica de negocio**: Toda lógica de negocio en casos de uso
3. **Server Actions como controladores**: Usar Server Actions para exponer operaciones
4. **Atomic Design**: Organizar componentes por niveles (atoms, molecules, organisms, pages)
5. **Custom Hooks**: Encapsular lógica de estado en hooks personalizados
6. **Type Safety**: Usar TypeScript estrictamente, definir tipos por capa
7. **Error Handling**: Usar `ErrorHandlerComposer` consistentemente
8. **SSR First**: Obtener datos en Server Components, pasar como `initialData`
9. **Query Keys jerárquicas**: Para invalidación granular de React Query
10. **Transformers**: Usar transformers para Backend ↔ Domain

### ❌ DON'T

1. **No lógica de negocio en componentes**: Solo UI y coordinación
2. **No dependencias cruzadas**: Domain no depende de otras capas
3. **No llamadas directas a API desde componentes**: Usar repositorios
4. **No estado global innecesario**: Preferir estado local y URL params
5. **No mutaciones directas**: Usar Server Actions para cambios
6. **No tipos `any`**: Usar tipos específicos siempre
7. **No componentes monolíticos**: Dividir en atoms, molecules, organisms
8. **No duplicar lógica**: Reutilizar hooks y utilidades compartidas

---

## 📚 Referencias

- [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) - Guía de arquitectura detallada
- [API_ENDPOINTS_DOCUMENTATION.md](./API_ENDPOINTS_DOCUMENTATION.md) - Documentación de endpoints
- [CLAUDE.md](./CLAUDE.md) - Guía para desarrolladores

---

**Última actualización**: Diciembre 2024
**Versión del proyecto**: 0.1.0
**Framework**: Next.js 15.5.7, React 19.2.1
