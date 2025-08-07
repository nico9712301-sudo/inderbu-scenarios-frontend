# Flexible Scheduler - Refactorización Modular

## 📋 Descripción

Este módulo ha sido refactorizado desde un archivo monolítico de más de 800 líneas a una arquitectura modular siguiendo los principios de **Single Responsibility** y **Atomic Design**. Ahora incluye **persistencia inteligente en URL** para mejorar la experiencia del usuario.

## 🔗 Nueva Funcionalidad: URL Persistence

### ¿Qué se persiste en la URL?

- **📅 Fechas**: `date` (inicial) y `endDate` (final)
- **📆 Modo**: `single` o `range`
- **🗓️ Días de semana**: `weekdays=1,2,3,4,5` (L-V)

### ¿Qué NO se persiste?

- **🚫 timeSlotIds**: Son muy volátiles y harían URLs feas
- **🚫 Estado temporal**: Como períodos expandidos o loading
- **🚫 Opciones avanzadas**: Se simplificó la UI eliminando el toggle

### Ejemplos de URLs:

```bash
# Reserva simple
/scenario/16?date=2025-01-15&mode=single

# Reserva de rango
/scenario/16?date=2025-01-15&endDate=2025-01-20&mode=range

# Con días específicos
/scenario/16?date=2025-01-15&endDate=2025-01-20&weekdays=1,2,3,4,5&mode=range
```

### 🎯 Beneficios:

- **🔗 Shareability**: URLs compartibles con configuración
- **📌 Bookmarking**: Guardar configuraciones favoritas
- **⏪ Navigation**: Back/Forward funciona intuitivamente
- **🔄 Refresh**: No se pierde estado al refrescar

## 🏗️ Arquitectura

La nueva estructura sigue el patrón **Feature-Sliced Design + Atomic Design**:

```
flexible-scheduler/
├── 📁 components/
│   ├── 📁 atoms/          # Componentes básicos reutilizables
│   ├── 📁 molecules/      # Combinaciones de atoms
│   └── 📁 organisms/      # Componentes complejos de UI
├── 📁 hooks/              # Lógica de estado y efectos
├── 📁 constants/          # Configuraciones estáticas
├── 📁 utils/              # Funciones utilitarias puras
├── 📁 types/              # Definiciones de TypeScript
└── index.ts               # Exportaciones centralizadas
```

## 🎯 Principios Aplicados

### Single Responsibility Principle

- **Cada archivo tiene una responsabilidad específica**
- **Cada hook maneja un aspecto del estado**
- **Cada componente tiene una función clara**

### Atomic Design

- **Atoms**: Componentes básicos (buttons, inputs, etc.)
- **Molecules**: Combinaciones de atoms (headers, grids, etc.)
- **Organisms**: Secciones complejas (calendar, time selection, etc.)

### Separation of Concerns

- **UI Components**: Solo se encargan del renderizado
- **Hooks**: Manejan lógica de estado y efectos
- **Utils**: Funciones puras sin efectos secundarios
- **Constants**: Configuraciones estáticas

## 📦 Componentes Principales

### 🎣 Hooks

#### `useSchedulerState`

Maneja el estado general de la UI del scheduler:

- Configuración general
- Estados de expansión de períodos
- (Nota: Se simplificó eliminando opciones avanzadas)

#### `useDateConfiguration`

Gestiona toda la lógica relacionada con fechas:

- Selección de fechas
- Rangos de fechas
- Días de la semana

#### `useTimeSlotSelection`

Controla la selección de horarios:

- Toggle de slots individuales
- Aplicación de shortcuts
- Selección por períodos
- Validaciones de disponibilidad

#### `useReservationProcess`

Maneja el proceso completo de reservas:

- Validaciones finales
- Llamadas a la API
- Manejo de autenticación
- Estados de carga

#### `useURLPersistence`

Gestiona la persistencia inteligente en URL:

- Sincroniza configuración relevante con la URL
- Restaura estado desde URL al cargar
- Evita persistir datos volátiles (timeSlotIds)
- Maneja navegación browser (back/forward)
- (Actualizado: Ya no persiste estado de opciones avanzadas)

### 🧱 Atoms

- **TimeSlotButton**: Botón individual para cada horario
- **PeriodHeader**: Encabezado de cada período de tiempo
- **ShortcutButton**: Botón para atajos inteligentes
- **WeekdaySelector**: Selector de días de la semana
- **ReservationSummary**: Resumen de la reserva

### 🔗 Molecules

- **TimePeriodGroup**: Grupo completo de un período de tiempo
- **SmartShortcutsGrid**: Grid de atajos inteligentes
- **DateRangePicker**: Selector de rango de fechas
- **AdvancedOptions**: Panel de opciones avanzadas
- **ConfirmationSection**: Sección de confirmación y botones

### 🏢 Organisms

- **TimeSelectionGrid**: Grid completo de selección de horarios
- **FlexibleScheduler**: Componente principal orquestador

## 🛠️ Utilidades

### Time Formatters

```typescript
formatHourHuman(hour: number): string
generateTimeSlots(availabilityChecker): TimeSlot[]
getAvailableSlotsInPeriod(periodHours, checker): number[]
```

### Slot Validators

```typescript
validateSlotAvailability(hour, checker): boolean
getUnavailableSlots(slots, checker): number[]
validateMinimumSelection(count): boolean
validateDateSelection(date): boolean
```

### Date Helpers

```typescript
getTodayISO(): string
formatDateSafe(dateStr): string
validateDateRange(start, end): boolean
```

## 🎨 Constantes

### TIME_PERIODS

Define los períodos de tiempo con sus características:

- Mañana (6 AM - 12 PM)
- Tarde (12 PM - 6 PM)
- Noche (6 PM - 12 AM)
- Madrugada (12 AM - 6 AM)

### SMART_SHORTCUTS

Atajos predefinidos para selección rápida:

- Horario comercial
- Ejercicio matutino
- Hora del almuerzo
- Después del trabajo
- Mañana de fin de semana

### WEEKDAYS

Configuración de días de la semana.

## 🔄 Compatibilidad

El archivo original `components/flexible-scheduler.tsx` ahora re-exporta el nuevo componente, manteniendo **compatibilidad hacia atrás** sin romper imports existentes.

## Beneficios

### Mantenibilidad

- Código más fácil de entender y modificar
- Cambios aislados no afectan otros módulos
- Estructura predecible y consistente

### Testabilidad

- Cada unidad puede testearse independientemente
- Funciones puras fáciles de testear
- Mocks más sencillos para componentes aislados

### Reusabilidad

- Componentes y hooks reutilizables
- Utilidades compartibles entre módulos
- Constantes centralizadas

### Escalabilidad

- Fácil agregar nuevas funcionalidades
- Estructura preparada para crecimiento
- Separación clara de responsabilidades

### Developer Experience

- Intellisense más preciso
- Navegación de código más eficiente
- Debugging más sencillo

## 📖 Uso

```typescript
import { FlexibleScheduler } from "@/features/reservations/flexible-scheduler";

// O importar componentes específicos
import {
  useTimeSlotSelection,
  useURLPersistence,
  TimeSlotButton,
  formatHourHuman,
} from "@/features/reservations/flexible-scheduler";

// Ejemplo de uso de URL persistence
const MyScheduler = () => {
  // ... otros hooks

  useURLPersistence(
    config,
    dateRange,
    selectedWeekdays,
    handleRestoreConfig,
    handleRestoreDateRange,
    handleRestoreWeekdays,
  );

  // ... resto del componente
};
```

## 🧪 Testing

Cada módulo puede testearse independientemente:

```typescript
// Test de hooks
import { renderHook } from "@testing-library/react-hooks";
import { useTimeSlotSelection } from "./hooks/use-time-slot-selection";

// Test de utils
import { formatHourHuman } from "./utils/time-formatters";

// Test de componentes
import { render } from "@testing-library/react";
import { TimeSlotButton } from "./components/atoms/time-slot-button";
```

## 🎆 Mejoras Recientes

### 🎨 Simplificación de UI (v2.0)

- **Eliminado**: Botón "Mostrar/Ocultar opciones"
- **Mejorado**: "Seleccionar días específicos" aparece automáticamente cuando "Reservar varios días" está ON
- **🎯 Resultado**: UI más limpia e intuitiva
- **🔗 Impacto URL**: Ya no se persiste `advanced=true` en la URL

## 🎯 Próximos Pasos

1. **Implementar tests unitarios** para cada módulo
2. **Optimizar performance** con React.memo en componentes que lo necesiten
3. **Agregar Storybook** para documentar componentes
4. **Implementar validaciones más robustas**
5. **Considerar usar React Query** para el manejo de estado servidor
6. **Mejorar URL persistence**:
   - Compresión de parámetros largos
   - Validación de parámetros de URL
   - Fallbacks para URLs malformadas
   - Analytics de URLs compartidas
