# Proposal: Microanimaciones Three.js

## Why

Integrar Three.js para microanimaciones de apertura y cierre del modal y efectos visuales en estados de validacion de formularios, con degradacion graceful si WebGL no esta disponible.

**Business value:** experiencia visual distintiva sin sacrificar la carga ligera del widget

## What Changes

- `src/animations/capabilities.ts` — deteccion WebGL y politica `data-animation` / `prefers-reduced-motion`
- `src/animations/modal-scene.ts` — animaciones de entrada/salida del modal
- `src/animations/validation-fx.ts` — efecto visual breve en errores de validacion
- `src/animations/index.ts` — re-exports publicos
- `tests/animations/modal-scene.test.ts` — tests de modal (activacion, desactivacion, fallback)
- `tests/animations/validation-fx.test.ts` — tests de efectos de validacion
- Integracion minima en `src/ui/modal.ts`, `src/ui/feedback-form.ts`, `src/ui/contact-form.ts`
- Dependencia `three` en `package.json`

## Capabilities

- **New Capabilities:** `modal-animations`, `validation-fx`
- **Modified Capabilities:** `feedback-modal` (open/close animados), formularios (FX en error)

## Convenciones de integracion Three.js

- Imports granulares desde `three` (no namespace completo)
- Canvas con `pointer-events: none` dentro del shadow DOM del modal
- Sin `console.error` ni `console.warn` cuando WebGL no esta disponible
- Fallback CSS: scale+opacity (modal), shake (validacion)
- `data-animation="off"` y `prefers-reduced-motion: reduce` desactivan todas las animaciones

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/animations/capabilities.ts` | crear |
| `src/animations/modal-scene.ts` | crear |
| `src/animations/validation-fx.ts` | crear |
| `src/animations/index.ts` | modificar |
| `tests/animations/modal-scene.test.ts` | crear |
| `tests/animations/validation-fx.test.ts` | crear |
| `src/ui/modal.ts` | modificar |
| `src/ui/feedback-form.ts` | modificar |
| `src/ui/contact-form.ts` | modificar |
| `package.json` | agregar `three` |

## Impact

Riesgos: incremento del tamano del bundle; mitigar con tree-shaking en BC-011.

**Out of scope:** animaciones complejas 3D, particulas personalizadas, dependencias runtime externas en CDN, montaje de formularios en bootstrap.
