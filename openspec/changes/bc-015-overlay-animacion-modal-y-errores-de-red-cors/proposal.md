# Proposal: Overlay de animacion modal y errores de red CORS

## Why

El canvas Three.js se inserta en flujo del dialog, congela el torus a los 300 ms y el POST a la API rechaza en silencio cuando CORS/red fallan.

**Business value:** widget usable en blogs embebidos (arthurolg.com y el resto de sitios) sin layout roto y con feedback de error visible.

## What Changes

- `src/animations/modal-scene.ts` — overlay absoluto, entrada CSS, RAF continuo
- `src/ui/modal.ts` — overflow del dialog, alerta de estado post-envio
- `src/api/contact-client.ts` — catch de TypeError de fetch
- Docs y version `1.0.2` (no reutilizar `1.0.1`)

## Capabilities

- **Modified Capabilities:** modal animation overlay, contact client network errors, modal status alert

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/animations/modal-scene.ts` | modificar |
| `src/ui/modal.ts` | modificar |
| `src/api/contact-client.ts` | modificar |
| `tests/animations/modal-scene.test.ts` | modificar |
| `tests/api/contact-client.test.ts` | modificar |
| `tests/ui/modal.test.ts` | modificar |
| `README.md` | modificar |
| `CHANGELOG.md` | modificar |
| `package.json` | modificar |

## Impact

El desbloqueo CORS de orígenes host ocurre en `api.appsutiles.dev`, no en este repo.

**Out of scope:** publicar tag `v1.0.2`, cambiar la API, redesplegar el blog Astro.
