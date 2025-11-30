# Paleta de Colores INDERBU

## Análisis del Sitio Oficial (https://inderbu.gov.co/)

Basado en el análisis del sitio web oficial de INDERBU, la paleta de colores institucional incluye:

### Colores Principales

1. **Verde (Primary)**
   - **Uso**: Color principal institucional, representa deporte, juventud y vitalidad
   - **Aplicación**: Elementos destacados, botones principales, enlaces activos
   - **Valor actual en código**: `HSL(103, 100%, 36%)` = `#00B84A` (verde esmeralda)
   - **RGB aproximado**: `rgb(0, 184, 74)`

2. **Azul Institucional (Secondary)**
   - **Uso**: Header gov.co, elementos gubernamentales
   - **Aplicación**: Barra superior, enlaces institucionales
   - **Valor actual en código**: `blue-600` = `#2563EB`
   - **RGB**: `rgb(37, 99, 235)`

3. **Blanco (Background)**
   - **Uso**: Fondos principales, tarjetas, espacios limpios
   - **Aplicación**: Fondos de página, cards, modales
   - **Valor**: `#FFFFFF` / `rgb(255, 255, 255)`

4. **Negro/Gris Oscuro (Text)**
   - **Uso**: Textos principales, títulos
   - **Aplicación**: Contenido, headings, body text
   - **Valor**: `#1F2937` (gray-800) / `rgb(31, 41, 55)`

### Colores de Acento (Usados en la aplicación)

5. **Teal (Escenarios)**
   - **Uso**: Títulos de escenarios, elementos relacionados con instalaciones
   - **Aplicación**: Headers de escenarios, badges
   - **Valor**: `teal-600` = `#0D9488`
   - **RGB**: `rgb(13, 148, 136)`

6. **Naranja (Capacidad/Jugadores)**
   - **Uso**: Badges de capacidad, información de jugadores
   - **Aplicación**: Badges de jugadores
   - **Valor**: `orange-700` = `#C2410C`
   - **RGB**: `rgb(194, 65, 12)`

7. **Índigo (Espectadores)**
   - **Uso**: Badges de espectadores
   - **Aplicación**: Información de capacidad de espectadores
   - **Valor**: `indigo-700` = `#4338CA`
   - **RGB**: `rgb(67, 56, 202)`

8. **Rojo (Errores/Advertencias)**
   - **Uso**: Estados de error, advertencias
   - **Aplicación**: Mensajes de error, estados críticos
   - **Valor**: `red-600` = `#DC2626`
   - **RGB**: `rgb(220, 38, 38)`

9. **Verde (Éxito/Disponible)**
   - **Uso**: Estados exitosos, disponibilidad
   - **Aplicación**: Confirmaciones, slots disponibles
   - **Valor**: `green-500` = `#22C55E`
   - **RGB**: `rgb(34, 197, 94)`

## Paleta de Colores Actual en el Código

### Variables CSS (globals.css)

```css
/* Tema Claro */
--primary: 103, 100%, 36%; /* Verde esmeralda #00B84A */
--primary-foreground: 210 40% 98%; /* Blanco/crema para texto sobre verde */
--secondary: 210 40% 96.1%; /* Gris claro */
--secondary-foreground: 222.2 47.4% 11.2%; /* Gris oscuro */
--complementary: 291 91% 83%; /* Rosa/magenta claro */
--muted: 210 40% 96.1%; /* Gris claro */
--destructive: 0 84.2% 60.2%; /* Rojo #E63946 */
--border: 214.3 31.8% 91.4%; /* Gris claro para bordes */
```

### Colores Tailwind Utilizados

- **Verde Primary**: `hsl(103, 100%, 36%)` → `#00B84A`
- **Azul Header**: `blue-600` → `#2563EB`
- **Teal Escenarios**: `teal-600` → `#0D9488`
- **Naranja**: `orange-50/100/700` → Varios tonos
- **Índigo**: `indigo-50/100/700` → Varios tonos
- **Grises**: `gray-50` a `gray-900` → Escala completa

## Recomendaciones de Alineación

### Colores que Deben Mantenerse (Alineados con INDERBU)

✅ **Verde Primary** (`#00B84A`) - Color institucional principal
✅ **Azul Institucional** (`#2563EB`) - Para elementos gubernamentales
✅ **Blanco** - Fondos limpios
✅ **Grises** - Para textos y elementos neutros

### Colores que Podrían Ajustarse

⚠️ **Teal** - Actualmente usado para escenarios, pero podría alinearse más con el verde institucional
⚠️ **Naranja/Índigo** - Colores de acento que funcionan bien pero no son parte de la identidad oficial

## Propuesta de Paleta Unificada

### Colores Principales

1. **Verde INDERBU** (Primary): `#00B84A` / `HSL(103, 100%, 36%)`
2. **Azul Gobierno** (Secondary): `#2563EB` / `HSL(217, 91%, 60%)`
3. **Blanco**: `#FFFFFF`
4. **Gris Oscuro** (Text): `#1F2937` / `gray-800`

### Colores de Acento (Mantener para UX)

5. **Teal** (Escenarios): `#0D9488` - Mantener para diferenciación visual
6. **Naranja** (Jugadores): `#C2410C` - Mantener para badges
7. **Índigo** (Espectadores): `#4338CA` - Mantener para badges
8. **Rojo** (Errores): `#DC2626` - Estándar para errores
9. **Verde Éxito**: `#22C55E` - Para estados positivos

## Implementación Sugerida

La paleta actual está bien alineada con la identidad de INDERBU. El verde primary (`#00B84A`) es el color institucional correcto. Los colores de acento (teal, naranja, índigo) ayudan a la diferenciación visual sin contradecir la identidad.

### Mejoras Opcionales

1. **Consistencia en Escenarios**: Considerar usar variaciones del verde primary en lugar de teal para títulos de escenarios
2. **Badges**: Mantener naranja e índigo para diferenciación, pero podrían usar tonos más cercanos al verde primary
3. **Header**: El azul `blue-600` está correcto para elementos gubernamentales

## Referencias

- Sitio oficial INDERBU: https://inderbu.gov.co/
- Logo y elementos visuales del sitio web
- Manual de identidad visual (si está disponible públicamente)
