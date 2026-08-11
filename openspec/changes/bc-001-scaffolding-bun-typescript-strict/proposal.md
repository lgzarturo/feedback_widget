# Proposal: Scaffolding Bun + TypeScript strict

## Why

Inicializar el proyecto ejecutable con Bun, TypeScript strict y la estructura de carpetas base del widget CDN.

**Business value:** sin proyecto ejecutable ningún otro ítem del backlog puede comenzar.

## What Changes

- `package.json` — scripts `typecheck` y `test`, `type: "module"`
- `tsconfig.json` — `strict: true`, `target` y `module` ESNext
- `src/index.ts` — entry point con export mínimo
- Carpetas stub: `src/config/`, `src/ui/`, `src/api/`, `src/animations/`
- `.gitignore` — excluye `node_modules`, `dist`, archivos `.env`
- `tests/scaffolding.test.ts` — tests de aceptación BC-001

## Capabilities

- **New Capabilities:** `project-scaffolding`
- **Modified Capabilities:** (ninguna)

## Files Affected

| Archivo | Acción |
|---------|--------|
| `package.json` | verificar/ajustar scripts |
| `tsconfig.json` | verificar strict + ESNext |
| `.gitignore` | verificar patrones |
| `src/index.ts` | export `FEEDBACK_WIDGET_VERSION` |
| `src/config/index.ts` | stub vacío |
| `src/ui/index.ts` | stub vacío |
| `src/api/index.ts` | stub vacío |
| `src/animations/index.ts` | stub vacío |
| `tests/scaffolding.test.ts` | crear (nuevo) |

## Conventions

- Runtime: Bun 1.x
- Idioma: TypeScript `strict`, módulos ESNext (`"type": "module"`)
- Sin dependencias de runtime en BC-001 (solo devDependencies)
- Sin lógica de negocio, build de producción ni Three.js

## Impact

Riesgos: ninguno relevante.

**Out of scope:** lógica de negocio del widget, build de producción, dependencias de Three.js.
