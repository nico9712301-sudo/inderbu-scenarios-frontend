# El presente documento detalla cómo funciona el cambio entre tabs

## El flujo del cambio de tabs

### 1. El componente `Tabs` maneja el evento click internamente

```typescript
<Tabs
  value={getCurrentTab()}  // ← Estado actual
  className="w-full"
  onValueChange={(value) => {  // ← AQUÍ está el "click" event
    // Lógica cuando cambia el tab
  }}
>
```

### 2. El evento `onValueChange` se dispara cuando:

- Usuario hace **click** en cualquier `TabsTrigger`
- Se recibe el `value` del tab clickeado (`"all"`, `"active"`, `"inactive"`)

### 3. La lógica de cambio:

```typescript
onValueChange={(value) => {
  // Mapea el valor del tab a filtros
  const filterMap: Record<string, any> = {
    all: { active: undefined },      // Todos los items
    active: { active: true },        // Solo activos
    inactive: { active: false },     // Solo inactivos
  };

  onFilterChange(filterMap[value] || {}); // ← Aplica el filtro
}}
```

### 4. El flujo completo:

```
👆 User clicks "Activos" tab
    ↓
📤 onValueChange("active") se ejecuta
    ↓
🗺️ filterMap["active"] = { active: true }
    ↓
onFilterChange({ active: true }) se llama
    ↓
useSubScenarioData actualiza los filtros
    ↓
Los datos se refrescan con el filtro aplicado
    ↓
SubScenarioTable recibe solo items activos
    ↓
🎨 UI se re-renderiza mostrando solo activos
```

## Configuración de Tabs

### NavValues Definition:

```typescript
export const NavValues = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "active",
    label: "Activos",
  },
  {
    value: "inactive",
    label: "Inactivos",
  },
];
```

### Render de los Triggers:

```typescript
<TabsList>
  {NavValues.map((k) => (
    <TabsTrigger key={k.value} value={k.value}>
      {k.label}
    </TabsTrigger>
  ))}
</TabsList>
```

## Patrón de Diseño

Este es un patrón común en componentes de UI: el componente maneja la **interacción física** (click, keyboard) y expone **eventos semánticos** (`onValueChange`, `onSelect`, etc.).

## Estado del Tab Actual

```typescript
const getCurrentTab = useCallback(() => {
  const activeMap: Record<string, string> = {
    true: "active",
    false: "inactive",
  };

  return activeMap[String(filters.active)] || "all";
}, [filters.active]);
```

Esta función mapea el estado actual del filtro `active` al valor correspondiente del tab para mantener la sincronización entre el estado y la UI.
