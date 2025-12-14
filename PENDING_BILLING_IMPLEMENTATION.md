# Plan Detallado - Elementos Faltantes en Implementación de Billing

## Resumen Ejecutivo

Este documento detalla todos los elementos que faltan implementar en el frontend para completar la funcionalidad de billing según el Gherkin en `new-billing-implementation.md` y los endpoints disponibles en `API_ENDPOINTS_DOCUMENTATION.md`.

---

## 1. Constructor Drag-and-Drop de Plantillas de Recibos

### Estado Actual

- ✅ Tab "Plantillas" existe en `/dashboard/options`
- ✅ Componente `ReceiptTemplatesManagement` creado
- ❌ Botón "Crear nueva plantilla" solo muestra toast "próximamente"
- ❌ Constructor drag-and-drop NO implementado

### Endpoints del Backend a Usar

#### 1.1 Obtener Plantillas de Recibos

- **Endpoint:** `GET /api/templates/type/receipt`
- **Alternativa:** `GET /api/templates/receipts/active`
- **Uso:** Ya implementado en `getReceiptTemplatesAction`

#### 1.2 Crear Nueva Plantilla

- **Endpoint:** `POST /api/templates`
- **Request DTO:**
  ```typescript
  {
    name: string;                    // Required, minLength: 3
    type: 'receipt';                 // Required
    content: string;                  // Required, valid JSON string
    description?: string;             // Optional
    active?: boolean;                 // Optional, default: true
  }
  ```
- **Response:** `TemplateResponseDto`
- **Status Codes:** `201 Created`, `400 Bad Request`

#### 1.3 Actualizar Plantilla

- **Endpoint:** `PUT /api/templates/:id`
- **Request DTO:**
  ```typescript
  {
    name?: string;                    // Optional, minLength: 3
    content?: string;                 // Optional, valid JSON string
    description?: string;             // Optional
    active?: boolean;                 // Optional
  }
  ```

#### 1.4 Endpoints Adicionales Disponibles

- `GET /api/templates/:id` - Obtener plantilla por ID
- `DELETE /api/templates/:id` - Eliminar plantilla
- `POST /api/templates/:id/duplicate` - Duplicar plantilla
- `PUT /api/templates/:id/activate` - Activar plantilla
- `PUT /api/templates/:id/deactivate` - Desactivar plantilla
- `POST /api/templates/validate` - Validar contenido de plantilla

### Tareas de Implementación

1. **Crear Componente Constructor de Plantillas**
   - **Archivo:** `src/presentation/features/dashboard/billing/components/organisms/receipt-template-builder.tsx`
   - **Funcionalidad:**
     - Área de diseño drag-and-drop
     - Panel lateral con componentes disponibles:
       - Logo
       - Título
       - Datos del cliente
       - Tabla de conceptos
       - Costo por hora
       - Total
       - Datos bancarios
       - QR de pago
       - Texto libre
       - Fecha
     - Vista previa en tiempo real
     - Guardar como JSON en formato `content`
   - **Librería recomendada:** `@dnd-kit/core` + `@dnd-kit/sortable`
     - ✅ **Mejor opción para shadcn/ui**: @dnd-kit es la librería más recomendada y ampliamente usada con shadcn/ui
     - ✅ **Compatible con React 19**: Versiones 6.3.1+ soportan React 19.2.0
     - ✅ **Accesible**: Compatible con Radix UI (base de shadcn/ui)
     - ✅ **Ligera y moderna**: ~10kb gzipped
     - ✅ **TypeScript nativo**: Tipado completo
     - ✅ **Múltiples ejemplos con shadcn/ui**: Templates y ejemplos disponibles
     - **Instalación:** `pnpm add @dnd-kit/core @dnd-kit/sortable`
     - **Documentación:** https://docs.dndkit.com
     - **Ejemplos con shadcn/ui:** https://allshadcn.com/components/react-dnd-kit/

2. **Crear Server Action para Crear Plantilla**
   - **Archivo:** `src/infrastructure/web/controllers/dashboard/template.actions.ts` (nuevo)
   - **Funcionalidad:**
     - `createTemplateAction(data: CreateTemplateData)`
     - `updateTemplateAction(id: number, data: UpdateTemplateData)`
     - Usar `ErrorHandlerComposer`

3. **Integrar Constructor en ReceiptTemplatesManagement**
   - Modificar `handleCreateTemplate` para abrir modal con constructor
   - Al guardar, llamar a `createTemplateAction`

### Archivos a Crear/Modificar

- ✅ `src/presentation/features/dashboard/billing/components/organisms/receipt-template-builder.tsx` (NUEVO)
- ✅ `src/infrastructure/web/controllers/dashboard/template.actions.ts` (NUEVO)
- 🔄 `src/presentation/features/dashboard/billing/components/organisms/receipt-templates-management.tsx` (MODIFICAR)

---

## 2. Componente NotificationBell

### Estado Actual

- ❌ Componente `NotificationBell` NO existe
- ❌ No está integrado en el layout del dashboard

### Endpoints del Backend a Usar

#### 2.1 Obtener Notificaciones No Leídas

- **Endpoint:** `GET /api/notifications/unread/all`
- **Response DTO:**
  ```typescript
  NotificationResponseDto[] = [
    {
      id: number;
      type: 'payment_proof_uploaded' | 'receipt_generated' | 'receipt_sent';
      title: string;                      // e.g., "Nuevo comprobante de pago para reserva #123"
      message: string;
      reservationId: number | null;
      paymentProofId: number | null;
      receiptId: number | null;
      isRead: boolean;
      readAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }
  ]
  ```

#### 2.2 Obtener Contador de Notificaciones No Leídas

- **Endpoint:** `GET /api/notifications/unread/count`
- **Response:**
  ```typescript
  {
    count: number;
  }
  ```

#### 2.3 Marcar Notificación como Leída

- **Endpoint:** `PUT /api/notifications/:id/read`
- **Request:** Path parameter `id: number`
- **Response:** `NotificationResponseDto` (con `isRead: true`)

#### 2.4 Endpoints Adicionales Disponibles

- `GET /api/notifications` - Obtener todas las notificaciones (con paginación)
- `GET /api/notifications/:id` - Obtener notificación por ID
- `PUT /api/notifications/read/multiple` - Marcar múltiples como leídas

### Tareas de Implementación

1. **Crear Componente NotificationBell**
   - **Archivo:** `src/shared/components/organisms/notification-bell.tsx` (NUEVO)
   - **Funcionalidad:**
     - Icono de campana con badge de contador
     - Dropdown con lista de notificaciones no leídas
     - Al hacer clic en notificación:
       - Marcar como leída (`PUT /api/notifications/:id/read`)
       - Si `type === 'payment_proof_uploaded'` y `reservationId` existe:
         - Abrir `ReservationDetailsModal` con `initialTab="payment-proofs"`
         - Pasar `reservationId` para cargar la reserva
     - Polling cada 30 segundos para actualizar contador
     - ScrollArea para lista de notificaciones

2. **Crear Server Actions para Notificaciones**
   - **Archivo:** `src/infrastructure/web/controllers/dashboard/notifications.actions.ts` (NUEVO)
   - **Funcionalidad:**
     - `getUnreadNotificationsAction()`
     - `getUnreadNotificationsCountAction()`
     - `markNotificationAsReadAction(id: number)`

3. **Integrar NotificationBell en SimpleLayout**
   - **Archivo:** `src/shared/components/layout/simple-layout.tsx` (MODIFICAR)
   - **Ubicación:** En `AdminBar`, en la sección "Right Section", antes del link "Ver sitio"
   - Pasar callback `onNotificationClick` que reciba `NotificationResponseDto`

4. **Conectar NotificationBell con DashboardReservationsPage**
   - **Archivo:** `src/presentation/features/dashboard/reservations/components/DashboardReservationsPage.tsx` (MODIFICAR)
   - **Funcionalidad:**
     - Recibir callback desde `NotificationBell` vía contexto o props
     - Cuando se hace clic en notificación de tipo `payment_proof_uploaded`:
       - Cargar reserva usando `GET /reservations/:id`
       - Abrir `ReservationDetailsModal` con `initialTab="payment-proofs"`

### Archivos a Crear/Modificar

- ✅ `src/shared/components/organisms/notification-bell.tsx` (NUEVO)
- ✅ `src/infrastructure/web/controllers/dashboard/notifications.actions.ts` (NUEVO)
- 🔄 `src/shared/components/layout/simple-layout.tsx` (MODIFICAR)
- 🔄 `src/presentation/features/dashboard/reservations/components/DashboardReservationsPage.tsx` (MODIFICAR)

---

## 3. Pestaña "Comprobantes de pago" en ReservationDetailsModal

### Estado Actual

- ✅ `ReservationDetailsModal` existe
- ❌ NO tiene sistema de pestañas
- ❌ NO tiene pestaña "Comprobantes de pago"
- ❌ NO acepta prop `initialTab` para abrir con pestaña específica

### Endpoints del Backend a Usar

#### 3.1 Obtener Comprobantes de Pago de una Reserva

- **Endpoint:** `GET /api/payment-proofs/reservation/:reservationId`
- **Request:** Path parameter `reservationId: number`
- **Response DTO:**
  ```typescript
  PaymentProofResponse[] = [
    {
      id: number;
      reservationId: number;
      fileUrl: string;
      originalFileName: string;
      mimeType: string;
      fileSize: number;
      uploadedBy: number;
      createdAt: Date;
    }
  ]
  ```
- **Nota:** Ya implementado en `getPaymentProofsByReservationAction`

### Tareas de Implementación

1. **Agregar Sistema de Pestañas a ReservationDetailsModal**
   - **Archivo:** `src/presentation/features/reservations/components/organisms/reservation-details-modal.tsx` (MODIFICAR)
   - **Cambios:**
     - Importar `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` de `@/shared/ui/tabs`
     - Agregar prop `initialTab?: "details" | "payment-proofs"` a `ReservationDetailsModalProps`
     - Agregar estado `const [activeTab, setActiveTab] = useState<"details" | "payment-proofs">(initialTab || "details")`
     - Envolver contenido actual en `TabsContent value="details"`
     - Crear nueva `TabsContent value="payment-proofs"` que muestre comprobantes

2. **Implementar Pestaña de Comprobantes**
   - **Funcionalidad:**
     - Cargar comprobantes usando `getPaymentProofsByReservationAction` (ya existe)
     - Mostrar lista de comprobantes con:
       - Nombre del archivo (`originalFileName`)
       - Fecha de subida (`createdAt`)
       - Botón "Ver" que abre `fileUrl` en nueva pestaña
     - Mostrar mensaje si no hay comprobantes
     - Solo mostrar pestaña si `reservation.hasCost === true` o `reservation.subScenario?.hasCost === true`

3. **Sincronizar Pestaña con useEffect**
   - Cuando `reservation` cambia, actualizar `activeTab` a `initialTab`
   - Cargar comprobantes automáticamente cuando se abre la pestaña

### Archivos a Crear/Modificar

- 🔄 `src/presentation/features/reservations/components/organisms/reservation-details-modal.tsx` (MODIFICAR)

---

## 4. Integración de Notificaciones con Modal de Detalles

### Estado Actual

- ✅ `ReservationDetailsModal` existe
- ✅ `getPaymentProofsByReservationAction` existe
- ❌ NO hay conexión entre `NotificationBell` y apertura del modal
- ❌ NO se puede abrir modal con pestaña específica desde notificación

### Endpoints del Backend a Usar

#### 4.1 Obtener Reserva por ID

- **Endpoint:** `GET /reservations/:id`
- **Request:** Path parameter `id: number`
- **Response:** `ReservationWithDetailsResponseDto` (incluye `hasCost`, `hasPaymentProofs`)

### Tareas de Implementación

1. **Crear Contexto o Hook para Gestión de Notificaciones**
   - **Opción A:** Crear contexto `NotificationContext`
   - **Opción B:** Usar callback desde `SimpleLayout` hacia `DashboardReservationsPage`
   - **Recomendación:** Opción B (más simple, menos overhead)

2. **Modificar DashboardReservationsPage para Manejar Notificaciones**
   - **Archivo:** `src/presentation/features/dashboard/reservations/components/DashboardReservationsPage.tsx` (MODIFICAR)
   - **Funcionalidad:**
     - Agregar función `handleNotificationClick(notification: NotificationResponseDto)`
     - Si `notification.type === 'payment_proof_uploaded'` y `notification.reservationId` existe:
       - Cargar reserva usando `GET /reservations/:notification.reservationId`
       - Abrir `ReservationDetailsModal` con:
         - `reservation={loadedReservation}`
         - `initialTab="payment-proofs"`

3. **Pasar Callback desde SimpleLayout**
   - **Archivo:** `src/shared/components/layout/simple-layout.tsx` (MODIFICAR)
   - **Funcionalidad:**
     - `NotificationBell` debe recibir `onNotificationClick` callback
     - Este callback debe venir desde el componente que renderiza `SimpleLayout` (probablemente un layout wrapper)

4. **Crear Server Action para Obtener Reserva por ID**
   - **Archivo:** `src/infrastructure/web/controllers/dashboard/reservations.actions.ts` (verificar si existe)
   - **Funcionalidad:**
     - `getReservationByIdAction(id: number)`
     - Retornar `ReservationWithDetailsResponseDto`

### Archivos a Crear/Modificar

- 🔄 `src/presentation/features/dashboard/reservations/components/DashboardReservationsPage.tsx` (MODIFICAR)
- 🔄 `src/shared/components/layout/simple-layout.tsx` (MODIFICAR)
- ✅ `src/infrastructure/web/controllers/dashboard/reservations.actions.ts` (VERIFICAR/CREAR)

---

## 5. Resumen de Endpoints del Backend por Funcionalidad

### Notificaciones

- `GET /api/notifications/unread/all` - Obtener todas las no leídas
- `GET /api/notifications/unread/count` - Obtener contador
- `PUT /api/notifications/:id/read` - Marcar como leída

### Plantillas de Recibos

- `GET /api/templates/type/receipt` - Obtener plantillas de recibos
- `GET /api/templates/receipts/active` - Obtener solo activas
- `POST /api/templates` - Crear nueva plantilla
- `PUT /api/templates/:id` - Actualizar plantilla
- `GET /api/templates/:id` - Obtener por ID
- `DELETE /api/templates/:id` - Eliminar plantilla
- `POST /api/templates/:id/duplicate` - Duplicar
- `PUT /api/templates/:id/activate` - Activar
- `PUT /api/templates/:id/deactivate` - Desactivar
- `POST /api/templates/validate` - Validar contenido

### Comprobantes de Pago

- `GET /api/payment-proofs/reservation/:reservationId` - Obtener comprobantes de una reserva
- `POST /api/payment-proofs/upload` - Subir comprobante (ya implementado)

### Reservas

- `GET /reservations/:id` - Obtener reserva por ID (necesario para notificaciones)

---

## 6. Priorización de Implementación

### Prioridad ALTA (Bloqueantes para funcionalidad core)

1. ✅ **Pestaña "Comprobantes de pago" en ReservationDetailsModal**
   - Requerido para escenario Gherkin #8
   - Endpoints ya implementados
   - Tiempo estimado: 2-3 horas

2. ✅ **NotificationBell Component**
   - Requerido para escenario Gherkin #8
   - Endpoints disponibles
   - Tiempo estimado: 3-4 horas

3. ✅ **Integración Notificaciones → Modal**
   - Requerido para escenario Gherkin #8
   - Depende de #1 y #2
   - Tiempo estimado: 1-2 horas

### Prioridad MEDIA (Funcionalidad importante pero no bloqueante)

4. ⚠️ **Constructor Drag-and-Drop de Plantillas**
   - Requerido para escenario Gherkin #3
   - Requiere librería de drag-and-drop (verificar package.json)
   - Tiempo estimado: 8-12 horas (depende de complejidad del constructor)

---

## 7. Checklist de Implementación

### Constructor de Plantillas

- [x] ✅ Instalar `@dnd-kit/core` y `@dnd-kit/sortable` - **COMPLETADO**
  - Instalado: `@dnd-kit/core@6.3.1`
  - Instalado: `@dnd-kit/sortable@7.0.2`
  - Instalado: `@dnd-kit/utilities@3.2.2`
- [ ] Crear componente `ReceiptTemplateBuilder` usando @dnd-kit
- [ ] Crear Server Actions para templates (create, update)
- [ ] Integrar constructor en `ReceiptTemplatesManagement`
- [ ] Probar creación de plantilla
- [ ] Probar actualización de plantilla

### NotificationBell

- [ ] Crear componente `NotificationBell`
- [ ] Crear Server Actions para notificaciones
- [ ] Integrar en `SimpleLayout`
- [ ] Implementar polling de contador
- [ ] Implementar click handler para abrir modal
- [ ] Probar flujo completo

### Pestaña Comprobantes

- [ ] Agregar sistema de pestañas a `ReservationDetailsModal`
- [ ] Implementar pestaña "Comprobantes de pago"
- [ ] Agregar prop `initialTab`
- [ ] Cargar comprobantes automáticamente
- [ ] Probar visualización de comprobantes

### Integración Notificaciones

- [ ] Crear Server Action para obtener reserva por ID
- [ ] Implementar callback en `DashboardReservationsPage`
- [ ] Conectar `NotificationBell` con callback
- [ ] Probar flujo: notificación → modal → pestaña comprobantes

---

## 8. Notas Técnicas

### Librerías Necesarias

- **Drag-and-Drop:** ✅ **@dnd-kit/core** + **@dnd-kit/sortable** (RECOMENDADO)
  - **Instalación:** `pnpm add @dnd-kit/core @dnd-kit/sortable`
  - **Versiones compatibles con React 19:**
    - `@dnd-kit/core@^6.3.1`
    - `@dnd-kit/sortable@^7.0.2`
  - **Por qué @dnd-kit:**
    - ✅ Mejor integración con shadcn/ui (múltiples ejemplos disponibles)
    - ✅ Compatible con React 19.2.0
    - ✅ Accesible (compatible con Radix UI)
    - ✅ Ligera (~10kb gzipped)
    - ✅ TypeScript nativo
    - ✅ Excelente documentación
  - **Alternativa:** HTML5 Drag and Drop API nativa (más complejo, menos features)

### Patrones a Seguir

- Usar `ErrorHandlerComposer` en todos los Server Actions
- Usar `ContainerFactory` para resolver use cases
- Seguir Atomic Design (componentes en `organisms/`)
- Usar componentes shadcn/ui existentes

### Consideraciones de Performance

- NotificationBell: Polling cada 30 segundos (no muy frecuente)
- Cargar comprobantes solo cuando se abre la pestaña (lazy loading)
- Usar `useTransition` para operaciones asíncronas

---

---

## 9. Librería Drag-and-Drop Recomendada

### @dnd-kit - La Mejor Opción para shadcn/ui

**Librería:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Instalación:**

```bash
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^7.0.2 @dnd-kit/utilities
```

**Por qué @dnd-kit:**

- ✅ **Mejor integración con shadcn/ui** - Múltiples templates y ejemplos disponibles
- ✅ **Compatible con React 19** - Versiones 6.3.1+ soportan React 19.2.0
- ✅ **Accesible** - Compatible con Radix UI (base de shadcn/ui)
- ✅ **Ligera** - ~10kb gzipped
- ✅ **TypeScript nativo** - Tipado completo
- ✅ **Excelente documentación** - https://docs.dndkit.com

**Recursos:**

- Documentación: https://docs.dndkit.com
- Ejemplos con shadcn/ui: https://allshadcn.com/components/react-dnd-kit/
- Template Kanban: https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui

**Ver archivo detallado:** `DRAG_AND_DROP_LIBRARY_RECOMMENDATION.md`

---

**Última actualización:** 2025-12-12
**Versión:** 1.0.0
