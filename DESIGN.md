# DESIGN.md — Feedback Widget CDN

Documento de diseño visual, arquitectura de UI y límites de implementación
para el widget de feedback embebible vía CDN.

---

## Visión del Producto

Un widget de feedback **ligero, accesible y adaptable** que se inyecta en
cualquier sitio web mediante una sola línea de código. El usuario final
interactúa con un botón flotante que abre un modal con dos tabs: **Feedback**
(evaluación rápida con emojis) y **Contacto** (formulario directo).

El widget debe sentirse nativo en cualquier sitio, sin importar el diseño
del host, y funcionar perfectamente desde un teléfono de gama baja hasta
un monitor de escritorio.

---

## Principios de Diseño

### 1. Mobile First, Siempre

Toda decisión de diseño parte del viewport más pequeño (320px) y escala
hacia arriba. No se diseña para desktop y luego se "adapta" a móvil.

| Breakpoint | Nombre | Viewport | Comportamiento |
|:---:|:---|:---|:---|
| — | `mobile` | < 480px | Base. Modal a pantalla completa (bottom sheet) |
| `sm` | `mobile-landscape` | ≥ 480px | Modal centrado con max-width |
| `md` | `tablet` | ≥ 768px | Modal con padding lateral generoso |
| `lg` | `desktop` | ≥ 1024px | Modal anclado a la esquina del botón |

### 2. Adaptable al Host

El widget no impone un "look" — se adapta al contexto:

- Los colores primario y acento se configuran vía `data-primary-color` y
  `data-accent-color`
- La posición del botón y el modal se configuran vía `data-position`
- El z-index es configurable para evitar conflictos con el sitio host
- Las animaciones se pueden desactivar completamente con `data-animation="off"`

### 3. Encapsulación Total

El widget vive en su propio universo visual:

- **Shadow DOM** para encapsular estilos y evitar contaminación bidireccional
- Los estilos del host NO afectan al widget
- Los estilos del widget NO afectan al host
- Los event listeners se limitan al scope del widget

### 4. Accesibilidad (a11y)

No es opcional. Cada componente DEBE cumplir:

- `aria-label` descriptivo en todos los controles interactivos
- Navegación por teclado completa (Tab, Enter, Space, Escape, flechas)
- Focus trap en el modal mientras está abierto
- Contraste de color mínimo WCAG 2.1 AA (4.5:1 para texto, 3:1 para
  elementos interactivos)
- Indicadores de focus visibles (outline o ring)
- `role` semánticos donde corresponda (`dialog`, `tablist`, `tab`, `tabpanel`)

### 5. Performance Budget

El widget se carga en sitios de terceros — cada KB cuenta:

| Métrica | Límite |
|:---|:---|
| Bundle total (gzip) | < 200 KB |
| CSS (dentro del bundle) | < 10 KB sin comprimir |
| Tiempo de inicialización | < 100ms en 4G lento |
| Impacto en LCP del host | 0ms (defer + async init) |

---

## Anatomía del Widget

### Componentes Visuales

```
┌─────────────────────────────────────────────────┐
│ Sitio Host                                       │
│                                                   │
│                                                   │
│                                                   │
│                                                   │
│                             ┌───────────────────┐ │
│                             │   Modal Widget    │ │
│                             │  ┌─────┬────────┐ │ │
│                             │  │ Tab  │  Tab   │ │ │
│                             │  │Feed  │Contact │ │ │
│                             │  ├─────┴────────┤ │ │
│                             │  │              │ │ │
│                             │  │  Tab Panel   │ │ │
│                             │  │  (contenido) │ │ │
│                             │  │              │ │ │
│                             │  └──────────────┘ │ │
│                             └───────────────────┘ │
│                                          [FAB] ●  │
└─────────────────────────────────────────────────┘
```

### Jerarquía de Componentes

```
WidgetRoot (Shadow DOM host)
├── TriggerButton (FAB — Floating Action Button)
└── Modal (dialog)
    ├── ModalHeader
    │   ├── Título
    │   └── CloseButton (×)
    ├── TabBar
    │   ├── Tab "Feedback"
    │   └── Tab "Contacto"
    ├── TabPanel "Feedback"
    │   ├── EmojiScale (5 niveles)
    │   ├── CommentTextarea (opcional)
    │   └── SubmitButton
    ├── TabPanel "Contacto"
    │   ├── NameInput
    │   ├── EmailInput
    │   ├── MessageTextarea
    │   └── SubmitButton
    └── StatusBar (éxito / error / loading)
```

---

## Diseño por Componente

### Trigger Button (FAB)

El punto de entrada al widget. Un botón flotante circular con ícono de
chat/feedback.

**Especificaciones:**

| Propiedad | Mobile | Desktop |
|:---|:---|:---|
| Tamaño | 48×48 px | 56×56 px |
| Border radius | 50% (círculo) | 50% |
| Offset desde esquina | 16px | 24px |
| Sombra | `0 2px 8px rgba(0,0,0,0.15)` | `0 4px 12px rgba(0,0,0,0.2)` |
| Color de fondo | `data-primary-color` | `data-primary-color` |
| Color de ícono | Blanco (`#ffffff`) | Blanco (`#ffffff`) |

**Posicionamiento (CSS `position: fixed`):**

| `data-position` | CSS |
|:---|:---|
| `bottom-right` | `bottom: 16px; right: 16px` (mobile) / `bottom: 24px; right: 24px` (desktop) |
| `bottom-left` | `bottom: 16px; left: 16px` (mobile) / `bottom: 24px; left: 24px` (desktop) |
| `top-right` | `top: 16px; right: 16px` (mobile) / `top: 24px; right: 24px` (desktop) |
| `top-left` | `top: 16px; left: 16px` (mobile) / `top: 24px; left: 24px` (desktop) |

**Interacción:**

- Hover: elevar sombra + escalar 1.05 (si `data-animation="on"`)
- Active/pressed: escalar 0.95
- Focus visible: ring de 2px con offset
- Click/tap: abre el modal
- `aria-label="Abrir feedback"` (localizable)
- `aria-expanded` refleja el estado del modal

---

### Modal

Contenedor principal de los formularios. Se comporta diferente según el
viewport.

**Comportamiento responsive:**

| Viewport | Comportamiento |
|:---|:---|
| Mobile (< 480px) | **Bottom sheet** — ocupa el ancho completo, sube desde abajo, max-height 85vh, border-radius solo arriba |
| Tablet+ (≥ 480px) | **Popover anclado** — posicionado cerca del FAB, max-width 380px, border-radius 12px en las 4 esquinas |

**Especificaciones del modal:**

| Propiedad | Mobile | Desktop |
|:---|:---|:---|
| Width | 100% | 380px max |
| Max height | 85vh | 500px |
| Border radius | 16px 16px 0 0 | 12px |
| Padding | 16px | 20px |
| Background | `#ffffff` | `#ffffff` |
| Sombra | `0 -4px 24px rgba(0,0,0,0.12)` | `0 8px 32px rgba(0,0,0,0.16)` |
| Backdrop | `rgba(0,0,0,0.3)` | ninguno (solo popover) |

**Posicionamiento del popover (≥ 480px):**

El modal se ancla a la esquina opuesta del FAB para no taparse:

| `data-position` del FAB | Alineación del modal |
|:---|:---|
| `bottom-right` | Arriba del FAB, alineado a la derecha |
| `bottom-left` | Arriba del FAB, alineado a la izquierda |
| `top-right` | Debajo del FAB, alineado a la derecha |
| `top-left` | Debajo del FAB, alineado a la izquierda |

**Transiciones (si `data-animation="on"`):**

- Apertura mobile: slide-up 300ms ease-out + fade backdrop
- Apertura desktop: scale(0.95→1) + opacity(0→1) 200ms ease-out
- Cierre: inverso de apertura, 150ms
- Sin animación: display toggle inmediato

**Interacción:**

- Cerrar: botón ×, tecla Escape, click en backdrop (mobile)
- Focus trap activo mientras el modal está abierto
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- Al cerrar, el focus retorna al TriggerButton

---

### Tab Bar

Navegación entre las dos secciones: Feedback y Contacto.

**Especificaciones:**

| Propiedad | Valor |
|:---|:---|
| Altura | 44px |
| Separador inferior | 2px solid `#e5e7eb` |
| Tab activa — indicador | 2px solid `data-primary-color` |
| Tab activa — texto | `data-primary-color`, font-weight 600 |
| Tab inactiva — texto | `#6b7280`, font-weight 400 |
| Transición del indicador | 200ms ease |

**Semántica:**

```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-feedback">Feedback</button>
  <button role="tab" aria-selected="false" aria-controls="panel-contact">Contacto</button>
</div>
<div role="tabpanel" id="panel-feedback">...</div>
<div role="tabpanel" id="panel-contact" hidden>...</div>
```

**Navegación por teclado:**

- Flechas ← → mueven entre tabs
- Enter/Space activa la tab enfocada
- Tab (key) sale del tablist hacia el contenido del panel

---

### Feedback Form (Tab "Feedback")

Formulario de evaluación rápida con escala de emojis.

**Emoji Scale:**

| Nivel | Emoji | Rating numérico | Label a11y |
|:---:|:---:|:---:|:---|
| 1 | 😠 | 1 | Muy insatisfecho |
| 2 | 😕 | 2 | Insatisfecho |
| 3 | 😐 | 3 | Neutral |
| 4 | 🙂 | 4 | Satisfecho |
| 5 | 😍 | 5 | Muy satisfecho |

**Especificaciones:**

| Propiedad | Valor |
|:---|:---|
| Tamaño de emoji (mobile) | 36px |
| Tamaño de emoji (desktop) | 40px |
| Gap entre emojis | 8px |
| Emoji seleccionado | scale(1.2) + ring de 2px `data-primary-color` |
| Emoji no seleccionado | opacity 0.5 |
| Layout | flexbox, `justify-content: center` |

**Campos:**

1. **Emoji Scale** — Requerido. Selección única.
2. **Comentario** — Opcional. `<textarea>` con placeholder "¿Algo más que
   quieras compartir?" (localizable). Max 500 caracteres. Counter visible.
3. **Botón enviar** — Texto: "Enviar feedback". Deshabilitado si no hay
   emoji seleccionado.

**Payload preparado:**

```typescript
{
  rating: number,       // 1-5
  ratingEmoji: string,  // "😠" | "😕" | "😐" | "🙂" | "😍"
  comment: string,      // opcional
  formType: "feedback"
}
```

**Validación:**

- Sin emoji seleccionado → mensaje inline "Selecciona una opción" bajo la
  escala. El botón permanece deshabilitado.
- Sin texto en comentario → válido (es opcional)

---

### Contact Form (Tab "Contacto")

Formulario de contacto directo, independiente del feedback.

**Campos:**

| Campo | Tipo | Requerido | Validación |
|:---|:---|:---:|:---|
| Nombre | `<input type="text">` | Sí | No vacío (trim) |
| Email | `<input type="email">` | Sí | Formato email válido (regex básico) |
| Mensaje | `<textarea>` | Sí | No vacío (trim), max 1000 caracteres |

**Especificaciones de inputs:**

| Propiedad | Valor |
|:---|:---|
| Altura del input | 40px |
| Altura del textarea | 100px (mobile) / 120px (desktop) |
| Border | 1px solid `#d1d5db` |
| Border radius | 8px |
| Border (focus) | 2px solid `data-primary-color` |
| Border (error) | 2px solid `#ef4444` |
| Padding | 10px 12px |
| Font size | 14px (mobile) / 14px (desktop) |
| Label font size | 13px, font-weight 500, color `#374151` |
| Error text | 12px, color `#ef4444`, debajo del campo |
| Gap entre campos | 12px |

**Validación inline (en blur + on submit):**

- Nombre vacío → "El nombre es obligatorio"
- Email vacío → "El email es obligatorio"
- Email inválido → "Ingresa un email válido"
- Mensaje vacío → "El mensaje es obligatorio"

**Payload preparado:**

```typescript
{
  name: string,
  email: string,
  message: string,
  formType: "contact"
}
```

---

### Submit Button

Botón de envío compartido por ambos formularios (con texto diferente).

| Propiedad | Valor |
|:---|:---|
| Ancho | 100% del contenedor |
| Altura | 44px |
| Border radius | 8px |
| Background | `data-primary-color` |
| Background (hover) | `data-accent-color` |
| Color texto | `#ffffff` |
| Font size | 14px, font-weight 600 |
| Transición | background-color 150ms ease |
| Disabled | opacity 0.5, cursor not-allowed |
| Loading | spinner inline + texto "Enviando..." |

---

### Status Bar

Retroalimentación post-envío dentro del modal.

| Estado | Estilo | Texto (localizable) |
|:---|:---|:---|
| Éxito | Background `#f0fdf4`, border-left 4px `#22c55e` | "¡Gracias por tu feedback!" / "Mensaje enviado" |
| Error 401 | Background `#fef2f2`, border-left 4px `#ef4444` | "API key inválida" |
| Error 400 | Background `#fef2f2`, border-left 4px `#ef4444` | "Error de validación" |
| Error 5xx | Background `#fffbeb`, border-left 4px `#f59e0b` | "Error del servidor. Intenta de nuevo." |

---

## Tokens de Diseño

### Colores Base (internos del widget)

| Token | Valor | Uso |
|:---|:---|:---|
| `--fw-bg` | `#ffffff` | Fondo del modal |
| `--fw-text` | `#111827` | Texto principal |
| `--fw-text-secondary` | `#6b7280` | Texto secundario, placeholders |
| `--fw-border` | `#d1d5db` | Bordes de inputs y separadores |
| `--fw-border-light` | `#e5e7eb` | Separadores sutiles |
| `--fw-error` | `#ef4444` | Validación y errores |
| `--fw-success` | `#22c55e` | Confirmaciones de éxito |
| `--fw-warning` | `#f59e0b` | Errores de servidor (reintentar) |

### Colores Configurables (del host)

| Token | Fuente | Uso |
|:---|:---|:---|
| `--fw-primary` | `data-primary-color` | FAB, tab activa, focus rings, botón submit |
| `--fw-accent` | `data-accent-color` | Hover del botón submit |

### Tipografía

| Token | Valor |
|:---|:---|
| `--fw-font-family` | `system-ui, -apple-system, sans-serif` |
| `--fw-font-size-xs` | `12px` |
| `--fw-font-size-sm` | `13px` |
| `--fw-font-size-base` | `14px` |
| `--fw-font-size-lg` | `16px` |
| `--fw-font-weight-normal` | `400` |
| `--fw-font-weight-medium` | `500` |
| `--fw-font-weight-semibold` | `600` |

Se usa `system-ui` para evitar cargar fuentes externas y mantener
coherencia con el sistema operativo del usuario. NO se cargan Google Fonts
ni fuentes externas — cada KB cuenta en un widget CDN.

### Espaciado

| Token | Valor |
|:---|:---|
| `--fw-space-xs` | `4px` |
| `--fw-space-sm` | `8px` |
| `--fw-space-md` | `12px` |
| `--fw-space-base` | `16px` |
| `--fw-space-lg` | `20px` |
| `--fw-space-xl` | `24px` |

### Sombras

| Token | Valor |
|:---|:---|
| `--fw-shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` |
| `--fw-shadow-md` | `0 4px 12px rgba(0,0,0,0.15)` |
| `--fw-shadow-lg` | `0 8px 32px rgba(0,0,0,0.16)` |
| `--fw-shadow-fab` | `0 2px 8px rgba(0,0,0,0.15)` |
| `--fw-shadow-fab-hover` | `0 4px 16px rgba(0,0,0,0.2)` |

### Transiciones

| Token | Valor |
|:---|:---|
| `--fw-transition-fast` | `150ms ease` |
| `--fw-transition-base` | `200ms ease` |
| `--fw-transition-slow` | `300ms ease-out` |

---

## Animaciones (BC-009)

### Política de Animaciones

- `data-animation="on"` (default): todas las microanimaciones activas
- `data-animation="off"`: sin animaciones, transiciones de display inmediatas
- `prefers-reduced-motion: reduce`: desactiva automáticamente, sin importar
  el valor de `data-animation`

### Microanimaciones Three.js

| Evento | Animación | Duración | Fallback sin WebGL |
|:---|:---|:---|:---|
| Modal abre | Escena de entrada (partículas/geometría) | 300ms | CSS scale+opacity |
| Modal cierra | Escena de salida | 150ms | CSS scale+opacity |
| Error validación | Efecto visual breve en el campo | 200ms | CSS shake |
| Envío exitoso | Efecto celebratorio | 400ms | Ninguno |

### Degradación Graceful

```
¿WebGL disponible? ──→ Sí ──→ ¿data-animation="on"? ──→ Sí ──→ Three.js
                   │                                  └──→ No ──→ Sin animación
                   └──→ No ──→ ¿data-animation="on"? ──→ Sí ──→ CSS fallback
                                                      └──→ No ──→ Sin animación
```

Sin errores en consola en ningún caso. La ausencia de WebGL es silenciosa.

---

## Responsive Patterns

### Mobile (< 480px)

```
┌────────────────────────┐
│       Sitio Host       │
│                        │
│ ┌────────────────────┐ │
│ │ ══════════════════ │ │  ← drag handle (visual)
│ │ [Feedback][Contacto]│ │
│ │ ────────────────── │ │
│ │  😠 😕 😐 🙂 😍   │ │
│ │                    │ │
│ │  [Comentario...]   │ │
│ │                    │ │
│ │  [═══ Enviar ═══]  │ │
│ └────────────────────┘ │
│ ▓▓▓▓▓ backdrop ▓▓▓▓▓▓ │
└────────────────────────┘
```

- Bottom sheet con slide-up
- Backdrop semi-transparente
- Ocupa 100% del ancho
- Max-height 85vh con scroll interno si necesario
- Handle visual superior (decorativo, no draggable en v1)
- FAB se oculta mientras el modal está abierto

### Desktop (≥ 480px)

```
┌──────────────────────────────────┐
│              Sitio Host          │
│                                  │
│              ┌────────────────┐  │
│              │ Feedback    ✕  │  │
│              │ [Feed][Contact]│  │
│              │ ────────────  │  │
│              │ 😠 😕 😐 🙂 😍│  │
│              │               │  │
│              │ [Comentario]  │  │
│              │               │  │
│              │ [══ Enviar ══]│  │
│              └────────────────┘  │
│                           [FAB]  │
└──────────────────────────────────┘
```

- Popover flotante anclado al FAB
- Sin backdrop
- Ancho fijo 380px max
- FAB visible con `aria-expanded="true"`
- Sombra prominente para separar del contenido host

---

## Límites de Implementación

### En Scope (v1.0)

- Botón flotante configurable con 4 posiciones
- Modal con 2 tabs: Feedback + Contacto
- Formulario de feedback con escala de 5 emojis + comentario opcional
- Formulario de contacto con name, email, message
- Validación inline en blur y on submit
- Envío a `POST /v1/contact/messages` con `x-api-key`
- Status bar con feedback de éxito/error
- Microanimaciones Three.js con fallback CSS
- Bundle IIFE autocontenido < 200 KB gzip
- 2 idiomas base: `es`, `en`
- Playground local de desarrollo

### Fuera de Scope (v1.0)

- ❌ Temas oscuros / light-dark automático
- ❌ Drag del bottom sheet (solo visual handle)
- ❌ File attachments en el formulario
- ❌ Rate limiting del lado cliente
- ❌ Almacenamiento local de borradores
- ❌ Notificaciones push
- ❌ Analytics / tracking de eventos
- ❌ Panel admin de mensajes
- ❌ Múltiples instancias del widget en la misma página
- ❌ Custom CSS injection desde el host
- ❌ Server-side rendering (SSR) del widget
- ❌ Internacionalización completa (i18n framework) — solo strings hardcoded
  con switch por `data-locale`
- ❌ Animaciones 3D complejas (partículas personalizadas, física)
- ❌ `prefers-color-scheme` automático

### Decisiones Arquitectónicas

| Decisión | Elegido | Alternativa rechazada | Razón |
|:---|:---|:---|:---|
| Encapsulación | Shadow DOM | iframe / CSS Modules | Aislamiento total sin costo de comunicación cross-origin |
| Fuente tipográfica | `system-ui` | Google Fonts (Inter) | Cero bytes adicionales, coherencia con el OS del usuario |
| Formato del bundle | IIFE | ES Module | Compatibilidad con `<script defer>` sin `type="module"` |
| Animaciones | Three.js + CSS fallback | CSS-only / Lottie | Diferenciación visual premium con degradación graceful |
| Runtime de tests | Bun + Happy-DOM | Jest + JSDOM | Velocidad nativa, coherencia con el runtime de producción |
| Estilos | CSS custom properties en Shadow DOM | Tailwind / CSS-in-JS | Zero runtime overhead, aislamiento natural |
| Posicionamiento modal | `position: fixed` | `position: absolute` | Funciona con cualquier estructura DOM del host |

---

## Contrato de API Visual

### CSS Custom Properties Públicas

El widget expone estas custom properties en su shadow root para que el
integrador pueda hacer override **avanzado** (no documentado en v1,
pero posible):

```css
:host {
  --fw-primary: <data-primary-color>;
  --fw-accent: <data-accent-color>;
}
```

### Atributos HTML Configurables

Ver la tabla completa en `README.md` — sección "Configuración y Atributos".

### Eventos DOM

El widget NO dispara custom events en v1. Toda comunicación es
widget → API server. Esto es intencional para mantener la superficie
de API mínima.

---

## Reglas de Implementación para Agentes

1. **Cada componente es un archivo** — `trigger-button.ts`, `modal.ts`,
   `tabs.ts`, `feedback-form.ts`, `contact-form.ts`
2. **Estilos inline en el Shadow DOM** — via `<style>` dentro del shadow
   root, NO en archivos CSS separados
3. **Tokens vía CSS custom properties** — definidos en `:host`, consumidos
   por todos los componentes internos
4. **Mobile first en media queries** — base = mobile, `@media (min-width:
   480px)` para desktop
5. **Sin `!important`** — Shadow DOM elimina la necesidad
6. **Sin IDs para styling** — usar clases con prefijo `fw-` dentro del shadow
7. **Touch targets ≥ 44px** — Apple HIG / WCAG compliance
8. **No asumir viewport** — usar unidades relativas y max-width/max-height
9. **Probar con `data-animation="off"`** — toda la UI debe funcionar sin
   animaciones
10. **Probar sin WebGL** — el widget debe ser 100% funcional sin Three.js
