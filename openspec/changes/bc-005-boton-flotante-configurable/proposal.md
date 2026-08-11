# Proposal: Botón flotante configurable

## Why

Implementar el botón flotante de activación del widget con posición configurable en las cuatro esquinas y estilos derivados de la configuración data-feedback.

**Business value:** punto de entrada visible y personalizable para el usuario final del sitio host

## What Changes

- `src/ui/styles.ts` — mapa de posiciones CSS y generación de estilos encapsulados
- `src/ui/trigger-button.ts` — factory `createTriggerButton` con Shadow DOM
- `tests/ui/trigger-button.test.ts` — tests de aceptación BC-005

## Capabilities

- **New Capabilities:** `floating-trigger-button`
- **Modified Capabilities:** ninguno (bootstrap se integrará en BC-006)

## Convenciones de encapsulación

- Shadow DOM `mode: "open"` en el host fijo
- Estilos solo dentro del shadow root; sin `<style>` en `document.head`
- Selectores con prefijo `.fw-trigger`
- Posición vía estilos inline en el host (`position: fixed`)

## Files Affected

| Archivo | Acción |
|---------|--------|
| `src/ui/styles.ts` | crear |
| `src/ui/trigger-button.ts` | crear |
| `tests/ui/trigger-button.test.ts` | crear |

## Impact

Riesgos: z-index insuficiente puede ocultar el botón detrás de elementos del host (mitigado con `config.zIndex`, default 9999).

**Out of scope:** modal, formularios, animaciones Three.js, envío API
