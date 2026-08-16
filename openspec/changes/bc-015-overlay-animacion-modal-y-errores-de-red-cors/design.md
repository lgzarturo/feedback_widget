# Design: Overlay de animacion modal y errores de red CORS

**Status:** Aprobado.

## Approach

1. Inyectar `ensureModalStyles` tambien en el path Three.js.
2. Canvas `.fw-animation-canvas` como overlay (`position: absolute`, `pointer-events: none`).
3. Contenido (`.fw-modal-header`, `.fw-tabs-panels`) con `z-index: 1`.
4. RAF continuo hasta `playClose`/`dispose`; actualizar `state.rafId` en cada frame.
5. Aplicar entrada CSS (`scale`/`opacity`) junto al overlay 3D.
6. `sendContactMessage` captura excepciones de `fetch` y devuelve `{ ok: false, status: 0, userMessage }`.
7. El modal muestra `.fw-status` con `role="alert"` para exito o error.

## CORS (fuera de este repo)

La API debe ecoar `Origin` si esta en la allowlist, permitir `POST, OPTIONS` y headers `Content-Type, x-api-key`.

## Version

Patch **1.0.2**. `1.0.1` ya esta en jsDelivr y no se sobrescribe.
