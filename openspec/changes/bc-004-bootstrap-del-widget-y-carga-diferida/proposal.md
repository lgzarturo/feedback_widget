# Proposal: Bootstrap del widget y carga diferida

## Why

Implementar el arranque del widget con carga diferida via script defer, auto-inicializacion al DOMContentLoaded cuando existe un elemento con atributo data-feedback.

**Business value:** integracion de una linea de script sin bloquear el parsing de la pagina host

## What Changes

- `src/bootstrap.ts` — auto-init, `initFeedbackWidget`, idempotencia via WeakMap
- `src/index.ts` — re-exports y llamada a `bootstrapFeedbackWidget()` al cargar
- `tests/bootstrap.test.ts` — tests de aceptacion BC-004

## Capabilities

- **New Capabilities:** `widget-bootstrap`
- **Modified Capabilities:** `src/index.ts` (entry point CDN)

## Convenciones de ciclo de vida

- El script con `defer` ejecuta tras parsear HTML; `bootstrapFeedbackWidget` escucha `DOMContentLoaded` o corre de inmediato si el documento ya está listo
- Cada host `[data-feedback]` recibe una instancia `FeedbackWidgetInstance` con `host` y `config`
- Marcador `data-feedback-initialized` en el host tras la primera inicialización
- `WeakMap` evita instancias duplicadas en memoria

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/bootstrap.ts` | crear |
| `src/index.ts` | actualizar |
| `tests/bootstrap.test.ts` | crear |

## Impact

Riesks: conflictos con otros scripts que modifiquen el DOM al mismo tiempo

**Out of scope:** formularios, modal, llamadas API, build de produccion
