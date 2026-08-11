# Implementation Tasks — BC-002

## Discover

- [x] proposal.md con archivos afectados y convenciones
- [x] specs/toolchain-quality/spec.md con requisitos y escenarios

## Design

- [x] design.md con config Biome, CI workflow y openspec config
- [x] design.md aprobado antes de fase test

## Test (RED)

- [x] tests/smoke.test.ts con un test por acceptance criterion
- [x] Confirmar RED: CI y lint fallaron antes de implementar

## Implement (GREEN)

- [x] `.github/workflows/ci.yml` creado
- [x] `biome.json` ignora `.codebase-memory`
- [x] `package.json` formateado para Biome
- [x] `bun test`, `bun run lint`, `bun run typecheck` exit 0

## Review

- [x] `npx cc-codeconductor openspec validate` sin errores
- [x] BACKLOG.md BC-002 → DONE, Progress 100%
