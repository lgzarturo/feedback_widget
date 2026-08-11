# Design: Scaffolding Bun + TypeScript strict

**Status:** Aprobado — listo para fase test.

## Approach

Scaffolding mínimo: configuración Bun + TypeScript strict, entry point y carpetas stub sin lógica de negocio. Los tests de aceptación verifican estructura, typecheck y gitignore antes de cualquier feature posterior.

## Estructura de carpetas

```
src/
  index.ts              # export FEEDBACK_WIDGET_VERSION (stub)
  config/index.ts       # stub BC-003
  ui/index.ts           # stub BC-005+
  api/index.ts          # stub BC-010
  animations/index.ts   # stub BC-009
tests/
  scaffolding.test.ts   # tests BC-001 (nuevo)
  smoke.test.ts         # existente (BC-002, se conserva)
  setup.ts              # happy-dom preload (BC-002, se conserva)
```

## Scripts npm (package.json)

| Script | Comando | Propósito BC-001 |
|--------|---------|------------------|
| `typecheck` | `tsc --noEmit` | Gate obligatorio |
| `test` | `bun test` | Ejecutar tests de scaffolding |

## Decisiones de runtime

| Decisión | Valor | Razón |
|----------|-------|-------|
| Runtime | Bun 1.x | Toolchain unificado install/test/typecheck |
| Módulo | ESM (`"type": "module"`) | Compatibilidad CDN futura |
| Compilación | `noEmit: true` | Solo typecheck en BC-001, sin build |
| moduleResolution | `bundler` | Preparación para `bun build` (BC-011) |
| verbatimModuleSyntax | `true` | Imports explícitos; stubs usan `export {}` |

## Files Affected

- `package.json`, `tsconfig.json`, `.gitignore`
- `src/index.ts`, `src/config/index.ts`, `src/ui/index.ts`, `src/api/index.ts`, `src/animations/index.ts`
- `tests/scaffolding.test.ts` (nuevo)

## Acceptance Criteria

- [x] `bun install && bun run typecheck` ejecuta sin errores en un clon limpio
- [x] `tsconfig.json` tiene `strict: true` con `target` y `module` ESNext
- [x] Existen las carpetas `src/config`, `src/ui`, `src/api` y `src/animations` con `src/index.ts` compilando
- [x] `.gitignore` excluye `node_modules`, `dist` y archivos de entorno local

## Out of scope

Lógica de negocio del widget, build de producción, dependencias de Three.js.
