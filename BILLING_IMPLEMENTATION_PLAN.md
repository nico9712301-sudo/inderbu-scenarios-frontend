# Plan de Implementación - Sistema de Billing (Recibos de Pago)

## Resumen Ejecutivo

Este documento describe el plan completo para implementar el sistema de billing (recibos de pago) en el frontend, siguiendo las prácticas establecidas en `frontend_practices.md` y los endpoints documentados en `API_ENDPOINTS_DOCUMENTATION.md`.

## Arquitectura a Seguir

- **Clean Architecture** con separación de capas
- **Domain-Driven Design (DDD)**
- **Atomic Design** para componentes UI
- **Repository Pattern** para acceso a datos
- **Use Case Pattern** para lógica de negocio
- **Server Actions** para controladores

---

## Fase 1: Entidades de Dominio

### 1.1 Receipt Entity

**Ubicación**: `src/entities/billing/domain/ReceiptEntity.ts`

```typescript
export interface ReceiptEntity {
  id: number;
  reservationId: number;
  templateId: number;
  templateName?: string;
  pdfUrl: string;
  generatedAt: Date;
  sentAt?: Date;
  sentToEmail?: string;
  isGenerated: boolean;
  isSent: boolean;
}
```

### 1.2 Template Entity

**Ubicación**: `src/entities/billing/domain/TemplateEntity.ts`

```typescript
export interface TemplateEntity {
  id: number;
  name: string;
  type: "receipt" | "invoice" | "email";
  content: string; // JSON string
  description?: string;
  isActive: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 PaymentProof Entity

**Ubicación**: `src/entities/billing/domain/PaymentProofEntity.ts`

```typescript
export interface PaymentProofEntity {
  id: number;
  reservationId: number;
  fileUrl: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  createdAt: Date;
}
```

---

## Fase 2: Repositorios e Interfaces

### 2.1 Receipt Repository

**Ubicación**:

- Interface: `src/entities/billing/infrastructure/IReceiptRepository.ts`
- Implementation: `src/infrastructure/repositories/billing/receipt-repository.adapter.ts`

### 2.2 Template Repository

**Ubicación**:

- Interface: `src/entities/billing/infrastructure/ITemplateRepository.ts`
- Implementation: `src/infrastructure/repositories/billing/template-repository.adapter.ts`

### 2.3 PaymentProof Repository

**Ubicación**:

- Interface: `src/entities/billing/infrastructure/IPaymentProofRepository.ts`
- Implementation: `src/infrastructure/repositories/billing/payment-proof-repository.adapter.ts`

### 2.4 SubScenarioPrice Repository (Actualizar)

**Ubicación**: `src/infrastructure/repositories/billing/sub-scenario-price-repository.adapter.ts`

---

## Fase 3: Use Cases

### 3.1 Receipt Use Cases

**Ubicación**: `src/application/dashboard/billing/use-cases/`

- `GenerateReceiptUseCase.ts`
- `SendReceiptByEmailUseCase.ts`
- `GetReceiptsByReservationUseCase.ts`
- `DownloadReceiptUseCase.ts`

### 3.2 Template Use Cases

**Ubicación**: `src/application/dashboard/billing/use-cases/`

- `GetReceiptTemplatesUseCase.ts`
- `CreateReceiptTemplateUseCase.ts`
- `UpdateReceiptTemplateUseCase.ts`

### 3.3 PaymentProof Use Cases

**Ubicación**: `src/application/dashboard/billing/use-cases/`

- `UploadPaymentProofUseCase.ts`
- `GetPaymentProofsByReservationUseCase.ts`

### 3.4 SubScenarioPrice Use Cases

**Ubicación**: `src/application/dashboard/billing/use-cases/`

- `CreateSubScenarioPriceUseCase.ts`
- `UpdateSubScenarioPriceUseCase.ts`
- `GetSubScenarioPriceUseCase.ts`
- `DeleteSubScenarioPriceUseCase.ts`

---

## Fase 4: Server Actions

### 4.1 Billing Actions

**Ubicación**: `src/infrastructure/web/controllers/dashboard/billing.actions.ts`

- `generateReceiptAction`
- `sendReceiptByEmailAction`
- `getReceiptsByReservationAction`
- `downloadReceiptAction`
- `getReceiptTemplatesAction`
- `createReceiptTemplateAction`
- `updateReceiptTemplateAction`
- `uploadPaymentProofAction`
- `getPaymentProofsByReservationAction`

### 4.2 SubScenarioPrice Actions

**Ubicación**: `src/infrastructure/web/controllers/dashboard/sub-scenario-price.actions.ts`

- `createSubScenarioPriceAction`
- `updateSubScenarioPriceAction`
- `getSubScenarioPriceAction`
- `deleteSubScenarioPriceAction`

---

## Fase 5: Componentes UI (Atomic Design)

### 5.1 Atoms

**Ubicación**: `src/presentation/features/dashboard/billing/components/atoms/`

- `receipt-download-button.tsx` - Botón para descargar recibo
- `payment-proof-upload-zone.tsx` - Zona de upload de comprobante

### 5.2 Molecules

**Ubicación**: `src/presentation/features/dashboard/billing/components/molecules/`

- `receipt-template-selector.tsx` - Selector de plantilla
- `receipt-history-list.tsx` - Lista de recibos generados
- `payment-proof-list.tsx` - Lista de comprobantes
- `sub-scenario-price-input.tsx` - Input para precio por hora

### 5.3 Organisms

**Ubicación**: `src/presentation/features/dashboard/billing/components/organisms/`

- `generate-receipt-modal.tsx` - Modal para generar recibo
- `send-receipt-modal.tsx` - Modal para enviar recibo por email
- `receipts-history-modal.tsx` - Modal con historial de recibos
- `reservation-actions-menu.tsx` - Menú 3-dots con acciones de reserva
- `receipt-templates-management.tsx` - Gestión de plantillas
- `payment-proof-upload-section.tsx` - Sección completa de upload (cliente)

### 5.4 Pages

**Ubicación**: `src/presentation/features/dashboard/billing/components/pages/`

- `receipt-templates-page.tsx` - Página de gestión de plantillas

---

## Fase 6: Integraciones

### 6.1 Actualizar Formulario de Sub-Scenarios

**Archivos a modificar**:

- `src/presentation/features/sub-scenario/components/organisms/sub-scenario-form.tsx`
- `src/presentation/features/dashboard/sub-scenarios/hooks/use-sub-scenario-form-data.hook.ts`

**Cambios**:

- Agregar campo `hourlyPrice` que aparece cuando `hasCost` es `true`
- Validar que `hourlyPrice` sea requerido cuando `hasCost` es `true`
- Al guardar, si `hasCost` cambia de `true` a `false`, eliminar precio
- Al guardar, si `hasCost` es `true` y hay `hourlyPrice`, crear/actualizar precio

### 6.2 Actualizar Tabla de Reservas

**Archivo a modificar**:

- `src/presentation/features/dashboard/reservations/components/organisms/dashboard-reservations-table.tsx`

**Cambios**:

- Reemplazar columna "actions" con botón FileEdit por columna "Acciones" con menú 3-dots
- Menú 3-dots muestra opciones según `hasCost`:
  - Si `hasCost: false`: Solo "Ver detalle"
  - Si `hasCost: true`: "Ver detalle", "Generar recibo", "Enviar recibo por email", "Ver facturas"

### 6.3 Actualizar Página de Opciones

**Archivo a modificar**:

- `src/presentation/features/dashboard/options/components/pages/options-page-with-tabs.tsx`

**Cambios**:

- Agregar nueva pestaña "Plantillas" junto a "Facturas"
- Integrar componente `ReceiptTemplatesManagement`

### 6.4 Actualizar Página de Reservas del Cliente

**Archivo a modificar**:

- `src/presentation/features/reservations/components/organisms/reservations-container.component.tsx`

**Cambios**:

- Agregar sección "Comprobante de pago" cuando la reserva tiene `hasCost: true` y está en estado "Pendiente"
- Mostrar advertencia de 24 horas
- Integrar componente `PaymentProofUploadSection`

### 6.5 Actualizar Modal de Confirmación de Reserva

**Archivo a modificar**:

- `src/presentation/features/reservations/components/molecules/clickable-status-badge.tsx` (o donde se maneje la confirmación)

**Cambios**:

- Si reserva tiene `hasCost: true`:
  - Si tiene comprobantes: Confirmar directamente
  - Si no tiene comprobantes: Mostrar modal con opciones:
    - "Subir comprobante de pago manualmente"
    - "Confirmar sin comprobante" (requiere justificación)

---

## Fase 7: Hooks Personalizados

### 7.1 Billing Hooks

**Ubicación**: `src/presentation/features/dashboard/billing/hooks/`

- `use-receipt-generation.ts` - Hook para generar recibos
- `use-receipt-templates.ts` - Hook para gestionar plantillas
- `use-payment-proof-upload.ts` - Hook para subir comprobantes
- `use-sub-scenario-price.ts` - Hook para gestionar precios

---

## Fase 8: Transformers

### 8.1 Billing Transformers

**Ubicación**: `src/infrastructure/transformers/`

- `ReceiptTransformer.ts`
- `TemplateTransformer.ts`
- `PaymentProofTransformer.ts`

---

## Fase 9: Dependency Injection

### 9.1 Actualizar DI Container

**Archivo a modificar**: `src/infrastructure/config/di/container.factory.ts`

**Registros necesarios**:

- Repositorios de billing
- Use cases de billing
- Tokens en `src/infrastructure/config/di/tokens.ts`

---

## Orden de Implementación

1. ✅ Entidades de dominio (Receipt, Template, PaymentProof)
2. ✅ Interfaces de repositorios
3. ✅ Implementaciones de repositorios
4. ✅ Transformers
5. ✅ Use Cases
6. ✅ Server Actions
7. ✅ Hooks personalizados
8. ✅ Componentes UI (atoms → molecules → organisms → pages)
9. ✅ Integraciones (formularios, tablas, modales)
10. ✅ Dependency Injection
11. ✅ Testing y validación

---

## Notas Importantes

- **Reutilizar componentes existentes**: Usar shadcn/ui, no crear nuevos componentes base
- **Seguir Atomic Design**: Organizar componentes por niveles
- **Type Safety**: Todos los tipos deben estar definidos
- **Error Handling**: Usar `ErrorHandlerComposer` consistentemente
- **SSR First**: Obtener datos en Server Components cuando sea posible
- **Query Keys**: Usar React Query con query keys jerárquicas

---

## Endpoints del Backend (Ya Implementados)

Ver `API_ENDPOINTS_DOCUMENTATION.md` para referencia completa de endpoints.
