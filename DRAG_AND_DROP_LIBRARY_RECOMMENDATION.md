# Recomendación de Librería Drag-and-Drop para Constructor de Plantillas

## 🎯 Librería Recomendada: @dnd-kit

### ¿Por qué @dnd-kit?

**@dnd-kit** es la librería de drag-and-drop **más recomendada y ampliamente usada** con shadcn/ui y proyectos modernos de React.

### ✅ Ventajas

1. **Perfecta integración con shadcn/ui**
   - Múltiples templates y ejemplos disponibles
   - Compatible con Radix UI (base de shadcn/ui)
   - Funciona perfectamente con Tailwind CSS

2. **Compatible con React 19**
   - Versiones actuales soportan React 19.2.0
   - `@dnd-kit/core@^6.3.1`
   - `@dnd-kit/sortable@^7.0.2`

3. **Accesible**
   - Soporte completo para teclado
   - Compatible con screen readers
   - Alineado con principios de accesibilidad de Radix UI

4. **Ligera y moderna**
   - ~10kb gzipped
   - TypeScript nativo
   - Excelente rendimiento

5. **Excelente documentación**
   - Documentación oficial completa: https://docs.dndkit.com
   - Múltiples ejemplos con shadcn/ui
   - Comunidad activa

### 📦 Instalación

```bash
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^7.0.2
```

### 📚 Recursos y Ejemplos

1. **Documentación oficial:**
   - https://docs.dndkit.com

2. **Ejemplos con shadcn/ui:**
   - https://allshadcn.com/components/react-dnd-kit/
   - https://awesome-shadcn-ui.com/shadcn-drag-and-drop-sort
   - https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui

3. **Templates disponibles:**
   - Kanban boards con shadcn/ui
   - Sortable lists
   - Drag-and-drop forms
   - Nested drag-and-drop

### 🎨 Uso Básico con shadcn/ui

```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Ejemplo básico de componente sortable
function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Uso en componente
function TemplateBuilder() {
  const [items, setItems] = useState(['item1', 'item2', 'item3']);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => (
          <SortableItem key={id} id={id}>
            <Card>
              <CardContent>{id}</CardContent>
            </Card>
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### 🔧 Paquetes Necesarios

Para el constructor de plantillas, necesitarás:

1. **@dnd-kit/core** - Core library
2. **@dnd-kit/sortable** - Para listas ordenables
3. **@dnd-kit/utilities** - Utilidades (CSS transforms, etc.)

```bash
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^7.0.2 @dnd-kit/utilities
```

### 📖 Estructura para Constructor de Plantillas

```
TemplateBuilder/
├── components/
│   ├── ComponentPalette.tsx      # Panel lateral con componentes disponibles
│   ├── ComponentItem.tsx         # Item draggable del panel
│   ├── TemplateCanvas.tsx        # Área de diseño (droppable)
│   ├── TemplateComponent.tsx    # Componente renderizado en canvas (sortable)
│   └── ComponentSettings.tsx    # Panel de configuración de componente seleccionado
├── hooks/
│   └── useTemplateBuilder.ts    # Lógica de drag-and-drop
└── types/
    └── template-builder.types.ts
```

### 🎯 Componentes Disponibles para Plantillas

Según el Gherkin, los componentes disponibles son:

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

### ✅ Conclusión

**@dnd-kit** es la mejor opción porque:

- ✅ Funciona perfectamente con shadcn/ui
- ✅ Compatible con React 19
- ✅ Accesible
- ✅ Ligera y moderna
- ✅ Excelente documentación y ejemplos
- ✅ Ampliamente usada en la comunidad

---

**Última actualización:** 2025-12-12
**Versión recomendada:** @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^7.0.2
