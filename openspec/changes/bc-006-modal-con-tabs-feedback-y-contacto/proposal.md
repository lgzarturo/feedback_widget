# Proposal: Modal con tabs feedback y contacto

## Why

Implementar el contenedor modal que se abre al hacer clic en el boton flotante, con dos pestanas: Feedback y Contacto, navegables por teclado.

**Business value:** estructura de UI que separa evaluacion de experiencia y contacto directo

## What Changes

- `src/ui/tabs.ts` — factory `createTabs` con semantica WAI-ARIA tablist
- `src/ui/modal.ts` — factory `createFeedbackModal` con apertura/cierre, focus trap y tabs integradas
- `tests/ui/tabs.test.ts` — tests de navegacion por teclado entre tabs
- `tests/ui/modal.test.ts` — tests de apertura, cierre, focus trap e integracion con trigger

## Capabilities

- **New Capabilities:** `feedback-modal`, `modal-tabs`
- **Modified Capabilities:** ninguno (bootstrap se integrara en item posterior)

## Convenciones de encapsulacion

- Shadow DOM `mode: "open"` en el host fijo del modal
- Estilos solo dentro del shadow root; sin `<style>` en `document.head`
- Selectores con prefijo `.fw-modal`, `.fw-tabs`
- `z-index` del host via `config.zIndex` (default 9999)
- Tabs como modulo reutilizable sin Shadow DOM propio (se monta dentro del shadow del modal)

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/ui/tabs.ts` | crear |
| `src/ui/modal.ts` | crear |
| `src/ui/index.ts` | modificar (exports) |
| `tests/ui/tabs.test.ts` | crear |
| `tests/ui/modal.test.ts` | crear |

## Impact

Riesgos: conflictos de z-index con modales del sitio host (mitigado con `config.zIndex`).

**Out of scope:** logica de envio de formularios, animaciones Three.js, cliente API, integracion en `bootstrap.ts`
