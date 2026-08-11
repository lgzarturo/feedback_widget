# Proposal: Build bundle unico feedback.min.js

## Why

Configurar el pipeline de build que produce un unico archivo `feedback.min.js` autocontenido, minificado y listo para CDN sin dependencias runtime externas en el sitio host. Montar el widget completo en bootstrap para que el bundle incluya UI, Three.js y cliente API.

**Business value:** script de una sola linea para integradores sin configuracion de bundler en el sitio host

## What Changes

- `build.ts` — pipeline `Bun.build` IIFE minificado
- `package.json` — scripts `build`, `build:check-size`
- `dist/feedback.min.js`, `dist/feedback.min.js.map` — artefactos generados
- `src/bootstrap.ts` — montaje trigger → modal → formularios → API
- `src/ui/modal.ts` — opcion `withForms`
- `tests/build/build.test.ts` — tests de pipeline y bundle
- `tests/bootstrap.test.ts` — tests de montaje widget

## Capabilities

- **New Capabilities:** `cdn-bundle-build`
- **Modified Capabilities:** `bootstrap` (montaje completo), `feedback-modal` (`withForms`)

## Convenciones

- Formato IIFE, minify completo, sourcemap linked local
- Verificacion tamano gzip &lt; 200 KB documentada en design.md
- Sin imports a URLs externas en bundle final

## Files Affected

| Archivo | Accion |
|---------|--------|
| `build.ts` | crear |
| `package.json` | modificar |
| `src/bootstrap.ts` | modificar |
| `src/ui/modal.ts` | modificar |
| `tests/build/build.test.ts` | crear |
| `tests/bootstrap.test.ts` | modificar |

## Impact

Riesgos: tamano del bundle con Three.js; mitigar con imports granulares y tree-shaking.

**Out of scope:** publicacion npm, semver automatico, source maps publicos en produccion, playground, release workflow.
