# Design: Botón flotante configurable

**Status:** Aprobado — listo para fase test.

## Approach

Módulo `trigger-button.ts` que crea un host `position: fixed` con Shadow DOM abierto. Los estilos viven exclusivamente dentro del shadow root (`styles.ts`) para no contaminar el documento host. El botón nativo `<button type="button">` recibe `aria-label`, color de fondo desde `config.primaryColor`, y posición según `config.position`. El `z-index` del host usa `config.zIndex`.

## Mapa de posiciones CSS

| `config.position` | `top` | `right` | `bottom` | `left` |
|-------------------|-------|---------|----------|--------|
| `bottom-right`    | auto  | 24px    | 24px     | auto   |
| `bottom-left`     | auto  | auto    | 24px     | 24px   |
| `top-right`       | 24px  | 24px    | auto     | auto   |
| `top-left`        | 24px  | auto    | auto     | 24px   |

Offset fijo: `24px` desde el borde correspondiente.

## Tokens de color

| Token            | Fuente                         | Uso                          |
|------------------|--------------------------------|------------------------------|
| `primaryColor`   | `config.primaryColor`          | `background-color` del botón |
| `accentColor`    | reservado (hover en BC-006+)   | —                            |

## Encapsulación de estilos

1. `host.attachShadow({ mode: "open" })` — aislamiento del CSS host.
2. `<style>` inyectado solo dentro del shadow root; nunca en `document.head`.
3. Selectores con prefijo `.fw-trigger` para evitar colisiones internas.

## Accesibilidad

| Requisito        | Implementación                                      |
|------------------|-----------------------------------------------------|
| Nombre accesible | `aria-label="Enviar feedback"` en el `<button>`     |
| Activación       | Clic del ratón, `Enter` y `Space` vía evento nativo |
| Foco             | `<button>` enfocable por defecto (`tabindex` implícito 0) |
| Rol              | Elemento `<button>` semántico                       |

## API pública

```typescript
export function createTriggerButton(
  config: WidgetConfig,
  onActivate?: () => void,
): HTMLElement;
```

Retorna el **host** fijo (no el botón interno). El consumidor (bootstrap en iteración futura) hace `document.body.appendChild(host)`.

## Files Affected

| Archivo                         | Acción  |
|---------------------------------|---------|
| `src/ui/styles.ts`              | crear   |
| `src/ui/trigger-button.ts`      | crear   |
| `tests/ui/trigger-button.test.ts` | crear |

## Acceptance Criteria

- [x] El botón se renderiza en bottom-left, bottom-right, top-left o top-right según data-position
- [x] El color de fondo del botón respeta data-primary-color de la configuración
- [x] Los estilos están encapsulados y no contaminan estilos globales del sitio host
- [x] El botón es accesible con aria-label y responde a Enter y Space
- [x] Tests verifican posicionamiento y aplicación de color primario

## Out of scope

Modal, formularios, animaciones Three.js, envío API, integración en `bootstrap.ts` (BC-006).
