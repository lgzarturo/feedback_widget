# Proposal: Playground de pruebas

## Why

Crear una pagina playground local para probar el widget con controles en vivo que modifican atributos data-feedback sin recargar la pagina.

**Business value:** entorno de demostracion y validacion manual para desarrolladores integradores

## What Changes

- `playground/index.html` — pagina de demostracion con host del widget y panel de controles
- `playground/controls.js` — logica de controles en vivo (posicion y colores)
- `package.json` — script `playground` que construye y sirve estaticos en localhost:3456
- `tests/playground/playground.test.ts` — smoke tests y verificacion de estructura
- `.env.example` — placeholder para API key de prueba
- `README.md` — seccion Playground local

## Capabilities

- **New Capabilities:** `local-playground`
- **Modified Capabilities:** ninguna en `src/`

## Convenciones

- Servidor local via `Bun.serve` inline en script npm (sin archivo servidor adicional)
- Widget cargado desde `dist/feedback.min.js` (requiere `bun run build` previo)
- API key placeholder `pk_test_placeholder` en HTML; nunca commitear claves reales
- Puerto fijo `3456` documentado en README

## Files Affected

| Archivo | Accion |
|---------|--------|
| `playground/index.html` | crear |
| `playground/controls.js` | crear |
| `package.json` | modificar (script `playground`) |
| `tests/playground/playground.test.ts` | crear |
| `.env.example` | crear |
| `README.md` | modificar |

## Impact

Riesgos: API key de prueba expuesta en playground; usar placeholder y `.env.example`.

**Out of scope:** despliegue del playground a produccion, autenticacion, persistencia de configuracion, cambios en `src/`.
