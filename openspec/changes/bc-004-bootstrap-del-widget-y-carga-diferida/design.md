# Design: Bootstrap del widget y carga diferida

**Status:** Aprobado — listo para fase test.

## Approach

Módulo `bootstrap.ts` que registra un listener `DOMContentLoaded` (o ejecuta de inmediato si el documento ya está listo), detecta elementos `[data-feedback]` sin inicializar y crea una instancia por host. La idempotencia se garantiza con un `WeakMap<HTMLElement, FeedbackWidgetInstance>` y el atributo marcador `data-feedback-initialized` en el host. Sin UI, modal ni API — solo parseo de configuración y registro de instancia.

## Ciclo de vida del widget

```
Script defer carga → index.ts importa bootstrap → bootstrapFeedbackWidget()
  → si readyState === "loading": espera DOMContentLoaded
  → si no: ejecuta de inmediato
  → querySelectorAll("[data-feedback]:not([data-feedback-initialized])")
  → initFeedbackWidget(host) por cada elemento
```

## API pública

| Export | Tipo | Descripción |
|--------|------|-------------|
| `initFeedbackWidget` | `(host: HTMLElement) => FeedbackWidgetInstance` | Inicialización manual de un host concreto |
| `bootstrapFeedbackWidget` | `() => void` | Registra auto-init en DOMContentLoaded |
| `FeedbackWidgetInstance` | `{ host, config }` | Instancia mínima (UI en BC-005+) |

## Regla de idempotencia

1. Si `instances.has(host)` → retornar instancia existente sin efectos secundarios.
2. Si el host ya tiene `data-feedback-initialized` → retornar instancia existente o crear si falta en mapa.
3. Tras inicializar: `instances.set(host, instance)` y `host.setAttribute("data-feedback-initialized", "")`.

Un segundo `initFeedbackWidget(host)` sobre el mismo elemento NO crea una segunda instancia.

## Integración CDN (src/index.ts)

- Re-exportar `initFeedbackWidget`, `bootstrapFeedbackWidget` y tipos.
- Invocar `bootstrapFeedbackWidget()` al cargar el módulo (comportamiento defer del script host).

## Files Affected

| Archivo | Acción |
|---------|--------|
| `src/bootstrap.ts` | crear |
| `src/index.ts` | actualizar exports y auto-bootstrap |
| `tests/bootstrap.test.ts` | crear |

## Acceptance Criteria

- [x] El widget se inicializa automáticamente al detectar `[data-feedback]` tras DOMContentLoaded
- [x] La inicialización es idempotente: un segundo intento no crea instancias duplicadas
- [x] El script exporta `initFeedbackWidget` para inicialización manual
- [x] Tests verifican auto-init y prevención de doble instancia con DOM simulado

## Out of scope

Formularios, modal, llamadas API, build de producción (BC-005+).
